import { readFileSync, writeFileSync } from 'node:fs';
import { ask } from '../ask';
import { SDK_SOURCE_DIR, TOP_K } from '../config';
import { chunkSdk } from '../ingest/chunk';
import { retrieve } from '../retrieve';
import { firstHitRank, mean, recall, reciprocalRank } from './metrics';

interface EvalCase {
  question: string;
  expectedSymbols: string[];
  required?: boolean;
}

const casesFile = new URL('../../../eval/retrieval-cases.json', import.meta.url);
const resultsFile = new URL('../../../eval/results.md', import.meta.url);
const endToEnd = process.argv.includes('--e2e');
const cases: EvalCase[] = JSON.parse(readFileSync(casesFile, 'utf8'));

// Guard against typos: every expected symbol must exist in the ingested SDK.
const known = new Set(chunkSdk(SDK_SOURCE_DIR).map((chunk) => chunk.symbol));
const unknown = cases.flatMap((c) => c.expectedSymbols).filter((symbol) => !known.has(symbol));
if (unknown.length > 0) throw new Error(`Unknown expected symbols: ${unknown.join(', ')}`);

const rows = [];
for (const evalCase of cases) {
  const { question, expectedSymbols } = evalCase;
  let symbols: string[];
  let typecheck: string | undefined;
  if (endToEnd) {
    const response = await ask(question);
    symbols = response.retrieval.chunks.map((chunk) => chunk.symbol);
    typecheck = response.typecheck === null ? 'no code' : response.typecheck.ok ? 'pass' : 'fail';
  } else {
    symbols = (await retrieve(question)).chunks.map((chunk) => chunk.symbol);
  }
  const rank = firstHitRank(symbols, expectedSymbols);
  const missing = expectedSymbols.filter((symbol) => !symbols.includes(symbol));
  rows.push({
    question: evalCase.required ? `${question} (required)` : question,
    hit: rank !== undefined,
    rank,
    rr: reciprocalRank(symbols, expectedSymbols),
    recall: recall(symbols, expectedSymbols),
    missing,
    typecheck,
  });
}

const hitRate = mean(rows.map((r) => (r.hit ? 1 : 0)));
const mrr = mean(rows.map((r) => r.rr));
const meanRecall = mean(rows.map((r) => r.recall));
const fullRecall = rows.filter((r) => r.recall === 1).length;

const lines = [
  `| Question | hit@${TOP_K} | first rank | recall@${TOP_K} | missing |${endToEnd ? ' type-check |' : ''}`,
  `|---|---|---|---|---|${endToEnd ? '---|' : ''}`,
  ...rows.map(
    (r) =>
      `| ${r.question} | ${r.hit ? 'yes' : 'no'} | ${r.rank ?? '-'} | ${r.recall.toFixed(2)} | ${r.missing.join(', ') || '-'} |` +
      (endToEnd ? ` ${r.typecheck} |` : ''),
  ),
  '',
  `**${rows.length} cases: hit@${TOP_K} ${hitRate.toFixed(2)}, MRR ${mrr.toFixed(2)}, ` +
    `mean recall@${TOP_K} ${meanRecall.toFixed(2)} (${fullRecall}/${rows.length} cases with every expected symbol retrieved)**`,
];
if (endToEnd) {
  const withCode = rows.filter((r) => r.typecheck !== 'no code');
  const passed = rows.filter((r) => r.typecheck === 'pass').length;
  lines.push(
    '',
    `**End-to-end: code generated for ${withCode.length}/${rows.length}, type-check passed for ${passed}/${withCode.length} of those**`,
  );
}

const report = lines.join('\n');
console.log(report);
writeFileSync(resultsFile, `# Retrieval eval results${endToEnd ? ' (end-to-end)' : ''}\n\n${report}\n`);
