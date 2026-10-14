/**
 * Experiment: does appending enum values to method chunks (e.g. "VariableType: … list …" on variable.create)
 * improve retrieval? Builds a temporary index from the enriched chunks and scores both indexes on the eval set.
 */
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { SDK_SOURCE_DIR, TOP_K } from '../config';
import { embedTexts } from '../embed';
import { chunkSdk } from '../ingest/chunk';
import { searchChunks, writeChunks } from '../store';
import { firstHitRank, mean, recall, reciprocalRank } from './metrics';

interface EvalCase {
  question: string;
  expectedSymbols: string[];
}

const cases: EvalCase[] = JSON.parse(readFileSync(new URL('../../../eval/retrieval-cases.json', import.meta.url), 'utf8'));
const tmpDir = mkdtempSync(join(tmpdir(), 'enum-experiment-'));

try {
  const enriched = chunkSdk(SDK_SOURCE_DIR, { enumValues: true });
  const enrichedCount = enriched.filter((c) => /\n\/\/ \w+: /.test(c.text)).length;
  const { vectors } = await embedTexts(enriched.map((chunk) => chunk.text));
  await writeChunks(enriched, vectors, tmpDir);
  const { vectors: questionVectors } = await embedTexts(cases.map((c) => c.question));

  const rows: string[] = [];
  const perCase: string[] = [];
  const results: Record<string, string[][]> = {};
  for (const [name, dbDir] of [['vector only (current chunks)', undefined], ['vector + enum values in method chunks', tmpDir]] as const) {
    results[name] = await Promise.all(questionVectors.map(async (v) => (await searchChunks(v, TOP_K, dbDir)).map((r) => r.chunk.symbol)));
    const lists = results[name];
    const hit = mean(cases.map((c, i) => (firstHitRank(lists[i], c.expectedSymbols) ? 1 : 0)));
    const mrr = mean(cases.map((c, i) => reciprocalRank(lists[i], c.expectedSymbols)));
    const rec = mean(cases.map((c, i) => recall(lists[i], c.expectedSymbols)));
    const missing = cases.flatMap((c, i) => c.expectedSymbols.filter((s) => !lists[i].includes(s)));
    rows.push(`| ${name} | ${hit.toFixed(2)} | ${mrr.toFixed(2)} | ${rec.toFixed(2)} | ${missing.join(', ') || '-'} |`);
  }
  const [before, after] = Object.values(results);
  cases.forEach((c, i) => {
    const rankBefore = firstHitRank(before[i], c.expectedSymbols) ?? '-';
    const rankAfter = firstHitRank(after[i], c.expectedSymbols) ?? '-';
    const recBefore = recall(before[i], c.expectedSymbols).toFixed(2);
    const recAfter = recall(after[i], c.expectedSymbols).toFixed(2);
    if (rankBefore !== rankAfter || recBefore !== recAfter) perCase.push(`| ${c.question} | ${rankBefore} → ${rankAfter} | ${recBefore} → ${recAfter} |`);
  });

  const report = [
    `| Variant (${cases.length} cases) | hit@${TOP_K} | MRR | recall@${TOP_K} | missing |`,
    '|---|---|---|---|---|',
    ...rows,
    '',
    `Cases that changed (${perCase.length}):`,
    '',
    '| Question | first rank | recall@5 |',
    '|---|---|---|',
    ...perCase,
  ].join('\n');
  console.log(report);
  writeFileSync(
    new URL('../../../eval/enum-results.md', import.meta.url),
    `# Enum-value enrichment experiment\n\nMethod chunks whose parameters are enums get one extra line listing the enum's ` +
      `values (${enrichedCount} of ${enriched.filter((c) => c.kind === 'method').length} method chunks). ` +
      `Both indexes are scored on the same eval set; embeddings are deterministic, so one run each. Reproduce with \`npm run eval:enum\`.\n\n${report}\n`,
  );
} finally {
  rmSync(tmpDir, { recursive: true, force: true });
}
