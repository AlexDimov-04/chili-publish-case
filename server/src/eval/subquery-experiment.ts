/**
 * Experiment: does splitting a question into sub-queries (one per API operation) before retrieval beat
 * plain vector retrieval on the eval set? Compares merge strategies and decomposer models over repeated runs.
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { zodTextFormat } from 'openai/helpers/zod';
import { z } from 'zod';
import { TOP_K } from '../config';
import { embedTexts, openai } from '../embed';
import { searchChunks, type ScoredChunk } from '../store';
import { firstHitRank, mean, recall, reciprocalRank } from './metrics';

interface EvalCase {
  question: string;
  expectedSymbols: string[];
}

const RUNS = Number(process.argv.find((a) => a.startsWith('--runs='))?.split('=')[1] ?? 3);
const MODELS = (process.argv.find((a) => a.startsWith('--models='))?.split('=')[1] ?? 'gpt-5.4-mini,gpt-6.1-sol').split(',');

const SubQueries = z.object({ queries: z.array(z.string()) });
const PROMPTS = {
  v1: `You prepare search queries for a retriever over the CHILI GraFx Studio SDK API reference.
Split the developer's question into the separate SDK operations needed to do it, as 1 to 3 short, standalone queries
(for example: "create a variable", "set the items of a list variable"). If the question needs only one operation,
return a single query. Describe operations in plain words; do not invent SDK method names.`,
  // v2, after diagnosing v1: SDK methods are generic over subtypes (e.g. create(parentId, type)), so a subtype word
  // like "list" in a query pulls retrieval toward type declarations instead of the method. Name operations generically.
  v2: `You prepare search queries for a retriever over the CHILI GraFx Studio SDK API reference.
Split the developer's question into the separate SDK operations needed to do it, as 1 to 3 short, standalone queries.
Name each operation generically, the way an API method would be documented: an action verb plus the kind of object
("create a variable", "set the items of a list variable", "select a layout"). Leave out concrete values, names and
subtypes that are just parameters. If the question needs only one operation, return a single query. Describe
operations in plain words; do not invent SDK method names.`,
} as const;
const PROMPT_VERSIONS = (process.argv.find((a) => a.startsWith('--prompts='))?.split('=')[1] ?? 'v1,v2').split(',') as (keyof typeof PROMPTS)[];

export async function decompose(question: string, model: string, prompt: keyof typeof PROMPTS = 'v2'): Promise<string[]> {
  const response = await openai().responses.parse({
    model,
    instructions: PROMPTS[prompt],
    input: question,
    text: { format: zodTextFormat(SubQueries, 'sub_queries') },
  });
  return (response.output_parsed?.queries ?? []).map((q) => q.trim()).filter(Boolean).slice(0, 3);
}

type Merge = (lists: ScoredChunk[][]) => string[];

/** Round-robin by rank across the lists (original question first), skipping duplicates. */
const roundRobin: Merge = (lists) => {
  const out: string[] = [];
  for (let rank = 0; out.length < TOP_K && rank < TOP_K; rank++)
    for (const list of lists) {
      const symbol = list[rank]?.chunk.symbol;
      if (symbol && !out.includes(symbol) && out.length < TOP_K) out.push(symbol);
    }
  return out;
};

const bestDistances = (lists: ScoredChunk[][]) => {
  const best = new Map<string, number>();
  for (const list of lists) for (const { chunk, distance } of list) best.set(chunk.symbol, Math.min(best.get(chunk.symbol) ?? 2, distance));
  return [...best].sort((a, b) => a[1] - b[1]).map(([symbol]) => symbol);
};

/** Union of all lists ranked by each chunk's best cosine similarity to any of the queries. */
const maxCosine: Merge = (lists) => bestDistances(lists).slice(0, TOP_K);

/** Each sub-query's best hit is guaranteed a slot; remaining slots by best cosine. */
const quota: Merge = (lists) => {
  const out: string[] = [];
  for (const list of lists.slice(1)) {
    const symbol = list[0]?.chunk.symbol;
    if (symbol && !out.includes(symbol)) out.push(symbol);
  }
  for (const symbol of bestDistances(lists)) if (out.length < TOP_K && !out.includes(symbol)) out.push(symbol);
  return out.slice(0, TOP_K);
};

const MERGES: [string, Merge][] = [
  ['round-robin', roundRobin],
  ['max cosine', maxCosine],
  ['quota + max cosine', quota],
];

const cases: EvalCase[] = JSON.parse(readFileSync(new URL('../../../eval/retrieval-cases.json', import.meta.url), 'utf8'));

function score(results: string[][]) {
  return {
    hit: mean(cases.map((c, i) => (firstHitRank(results[i], c.expectedSymbols) ? 1 : 0))),
    mrr: mean(cases.map((c, i) => reciprocalRank(results[i], c.expectedSymbols))),
    recall: mean(cases.map((c, i) => recall(results[i], c.expectedSymbols))),
    missing: cases.flatMap((c, i) => c.expectedSymbols.filter((s) => !results[i].includes(s))),
  };
}

const { vectors: questionVectors } = await embedTexts(cases.map((c) => c.question));
const baselineLists = await Promise.all(questionVectors.map((v) => searchChunks(v, TOP_K)));
const baseline = score(baselineLists.map((list) => list.map((r) => r.chunk.symbol)));

const rows: string[] = [
  `| vector only (current) | – | 1 | ${baseline.hit.toFixed(2)} | ${baseline.mrr.toFixed(2)} | ${baseline.recall.toFixed(2)} | ${baseline.missing.join(', ') || '-'} |`,
];
const examples: string[] = [];

for (const promptVersion of PROMPT_VERSIONS) for (const model of MODELS) {
  const perMerge = new Map<string, ReturnType<typeof score>[]>(MERGES.map(([name]) => [name, []]));
  for (let run = 0; run < RUNS; run++) {
    const subQueries = await Promise.all(cases.map((c) => decompose(c.question, model, promptVersion)));
    const lists = await Promise.all(
      cases.map(async (c, i) => {
        const { vectors } = await embedTexts(subQueries[i]);
        const subLists = await Promise.all(vectors.map((v) => searchChunks(v, TOP_K)));
        return [baselineLists[i], ...subLists];
      }),
    );
    if (run === 0) examples.push(...cases.slice(0, 3).map((c, i) => `- \`${promptVersion}\` \`${model}\`: "${c.question}" → ${subQueries[i].map((q) => `"${q}"`).join(', ')}`));
    for (const [name, merge] of MERGES) perMerge.get(name)!.push(score(lists.map(merge)));
  }
  for (const [name, runs] of perMerge) {
    const fmt = (key: 'hit' | 'mrr' | 'recall') => {
      const values = runs.map((r) => r[key]);
      const spread = Math.max(...values) - Math.min(...values);
      return `${mean(values).toFixed(2)}${spread > 0 ? ` (±${(spread / 2).toFixed(2)})` : ''}`;
    };
    const missingCounts = new Map<string, number>();
    for (const r of runs) for (const s of r.missing) missingCounts.set(s, (missingCounts.get(s) ?? 0) + 1);
    const missing = [...missingCounts].map(([s, n]) => `${s} (${n}/${runs.length})`).join(', ') || '-';
    rows.push(`| ${name} | ${promptVersion} · ${model} | ${runs.length} | ${fmt('hit')} | ${fmt('mrr')} | ${fmt('recall')} | ${missing} |`);
  }
}

const table = [
  `| Merge | Prompt · decomposer | Runs | hit@${TOP_K} | MRR | recall@${TOP_K} | missing (runs) |`,
  '|---|---|---|---|---|---|---|',
  ...rows,
].join('\n');
console.log(table);
console.log(examples.join('\n'));
writeFileSync(
  new URL('../../../eval/subquery-results.md', import.meta.url),
  `# Sub-query retrieval experiment\n\nThe question is split into 1–3 sub-queries by an LLM; the original question and each ` +
    `sub-query are embedded and searched (top ${TOP_K} each), then merged into ${TOP_K} chunks. Means over repeated runs ` +
    `(± half the min–max spread). Reproduce with \`npm run eval:subquery\`.\n\n${table}\n\nExample decompositions (first run):\n\n${examples.join('\n')}\n`,
);
