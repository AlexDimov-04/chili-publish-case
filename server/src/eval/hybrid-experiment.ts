/**
 * Experiment: does hybrid retrieval (vector + BM25 keyword search, fused with Reciprocal Rank Fusion) beat
 * vector-only retrieval on the eval set? Runs on a temporary copy of the index, reusing the stored vectors.
 * Result at the time of writing: no variant improved recall@5 or MRR, so the app stays vector-only.
 */
import * as lancedb from '@lancedb/lancedb';
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { CHUNKS_TABLE, TOP_K, VECTOR_DB_DIR } from '../config';
import { embedTexts } from '../embed';
import { firstHitRank, mean, recall, reciprocalRank } from './metrics';

const CANDIDATES = 20; // results taken from each list before fusion
const RRF_K = 60; // standard RRF constant

interface EvalCase {
  question: string;
  expectedSymbols: string[];
}

/** "sdk.variable.setListVariable" -> "sdk variable set List Variable", so BM25 can match words inside identifiers. */
const splitIdentifiers = (text: string) =>
  text
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    .replace(/([A-Z]+)([A-Z][a-z])/g, '$1 $2')
    .replace(/[._]/g, ' ');

/** Reciprocal Rank Fusion: score(symbol) = sum over lists of weight / (k + rank). */
function fuse(lists: string[][], weights: number[]): string[] {
  const scores = new Map<string, number>();
  lists.forEach((list, li) =>
    list.forEach((symbol, i) => scores.set(symbol, (scores.get(symbol) ?? 0) + weights[li] / (RRF_K + i + 1))),
  );
  return [...scores].sort((a, b) => b[1] - a[1]).map(([symbol]) => symbol);
}

const tmpDir = mkdtempSync(join(tmpdir(), 'hybrid-experiment-'));
try {
  const source = await (await lancedb.connect(VECTOR_DB_DIR)).openTable(CHUNKS_TABLE);
  const rows = (await source.query().toArray()).map((row) => {
    const name = splitIdentifiers(row.apiPath || row.symbol);
    const firstDocLine = (row.text as string).match(/\/\*\*\s*\n?\s*\*?\s*([^\n@]*)/)?.[1] ?? '';
    return {
      symbol: row.symbol as string,
      text: row.text as string,
      splitText: splitIdentifiers(row.text),
      name,
      summary: `${name} ${firstDocLine}`,
      vector: Array.from(row.vector as Float32Array),
    };
  });
  const table = await (await lancedb.connect(tmpDir)).createTable('chunks', rows);
  for (const column of ['text', 'splitText', 'name', 'summary']) {
    const config = lancedb.Index.fts({ stem: true, language: 'English', removeStopWords: true, lowercase: true });
    await table.createIndex(column, { config });
  }

  const cases: EvalCase[] = JSON.parse(readFileSync(new URL('../../../eval/retrieval-cases.json', import.meta.url), 'utf8'));
  const { vectors } = await embedTexts(cases.map((c) => c.question));

  const vectorTop = async (vector: number[], limit: number) =>
    (await table.vectorSearch(vector).distanceType('cosine').limit(limit).toArray()).map((r) => r.symbol as string);
  const keywordTop = async (question: string, column: string) =>
    (await table.search(question, 'fts', column).limit(CANDIDATES).toArray()).map((r) => r.symbol as string);
  const hybrid = (column: string, keywordWeight = 1) => async (question: string, vector: number[]) =>
    fuse([await vectorTop(vector, CANDIDATES), await keywordTop(question, column)], [1, keywordWeight]).slice(0, TOP_K);

  const variants: [string, (question: string, vector: number[]) => Promise<string[]>][] = [
    ['vector only (current)', (_q, vector) => vectorTop(vector, TOP_K)],
    ['hybrid, full text', hybrid('text')],
    ['hybrid, camelCase-split text', hybrid('splitText')],
    ['hybrid, API name only', hybrid('name')],
    ['hybrid, name + first JSDoc sentence', hybrid('summary')],
    ['hybrid, name + first JSDoc sentence, keyword weight 0.5', hybrid('summary', 0.5)],
  ];

  const lines = [`| Variant (${cases.length} cases) | hit@${TOP_K} | MRR | recall@${TOP_K} | missing |`, '|---|---|---|---|---|'];
  for (const [name, retrieveSymbols] of variants) {
    const results = await Promise.all(cases.map((c, i) => retrieveSymbols(c.question, vectors[i])));
    const hit = mean(cases.map((c, i) => (firstHitRank(results[i], c.expectedSymbols) ? 1 : 0)));
    const mrr = mean(cases.map((c, i) => reciprocalRank(results[i], c.expectedSymbols)));
    const rec = mean(cases.map((c, i) => recall(results[i], c.expectedSymbols)));
    const missing = cases.flatMap((c, i) => c.expectedSymbols.filter((s) => !results[i].includes(s)));
    lines.push(`| ${name} | ${hit.toFixed(2)} | ${mrr.toFixed(2)} | ${rec.toFixed(2)} | ${missing.join(', ') || '-'} |`);
  }

  const report = lines.join('\n');
  console.log(report);
  writeFileSync(
    new URL('../../../eval/hybrid-results.md', import.meta.url),
    `# Hybrid retrieval experiment\n\nBM25 (LanceDB FTS, English stemming, stop words removed) fused with vector search via ` +
      `Reciprocal Rank Fusion (k=${RRF_K}, top ${CANDIDATES} from each list). Reproduce with \`npm run eval:hybrid\`.\n\n${report}\n`,
  );
} finally {
  rmSync(tmpDir, { recursive: true, force: true });
}
