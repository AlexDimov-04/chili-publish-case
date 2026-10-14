/** Sends the sample questions to the running API and records the full answers in docs/samples.md. */
import { writeFileSync } from 'node:fs';
import type { AskResponse } from './ask';
import { PORT } from './config';

const API_URL = process.env.API_URL || `http://localhost:${PORT}`;

const REQUIRED = [
  'I want to create a list variable with 4 items: Banana, Apple, Strawberry and Tomato',
  'I want to create a snapshot of the currently active page',
  'How can I make sure that my end-user can change the position of a frame?',
];
const OWN = [
  'How do I change the text content of a text frame?',
  'List all layouts and select the one named "Instagram"',
  'Find the frame named "Logo" and set its width to 200',
  'How can I get notified when the variables in the document change?',
];

async function askApi(question: string): Promise<AskResponse> {
  const res = await fetch(`${API_URL}/api/ask`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ question }),
  });
  if (!res.ok) throw new Error(`${res.status} for "${question}": ${await res.text()}`);
  return (await res.json()) as AskResponse;
}

function typecheckLabel(r: AskResponse): string {
  if (r.typecheck === null) return 'no code generated';
  if (r.typecheck.ok) return 'passed';
  return `failed: ${r.typecheck.errors.map((e) => `line ${e.line}: ${e.message}`).join('; ')}`;
}

function render(r: AskResponse, index: number, required: boolean): string {
  const chunkRows = r.retrieval.chunks.map(
    (c) =>
      `| ${c.rank} | ${c.score.toFixed(2)} | \`${c.apiPath ?? c.symbol}\` | ${c.kind} | ` +
      `[${c.file.replace('packages/sdk/src/', '')}:${c.lines.join('-')}](${c.url}) |`,
  );
  return [
    `## ${index}. ${r.question}${required ? ' *(required)*' : ''}`,
    '',
    `**Type-check:** ${typecheckLabel(r)}`,
    '',
    r.answer.code ? '```ts\n' + r.answer.code + '\n```' : '_No code: the model reported that the retrieved context was insufficient._',
    '',
    `**Explanation:** ${r.answer.explanation}`,
    '',
    `**Used symbols:** ${r.answer.usedSymbols.map((s) => `\`${s}\``).join(', ') || 'none'}`,
    '',
    `**Retrieved context (top ${r.retrieval.topK}):**`,
    '',
    '| # | Score | Symbol | Kind | Source |',
    '|---|---|---|---|---|',
    ...chunkRows,
    '',
    `<sub>${r.meta.model} · ${r.meta.embeddingModel} · studio-sdk ${r.meta.sdkVersion} · ` +
      `latency ${Object.entries(r.meta.latencyMs).map(([k, v]) => `${k} ${v} ms`).join(', ')} · ` +
      `${r.meta.tokens.input} in / ${r.meta.tokens.output} out tokens</sub>`,
  ].join('\n');
}

const questions = [...REQUIRED.map((q) => ({ q, required: true })), ...OWN.map((q) => ({ q, required: false }))];
const sections: string[] = [];
for (const [i, { q, required }] of questions.entries()) {
  console.log(`Asking ${i + 1}/${questions.length}: ${q}`);
  sections.push(render(await askApi(q), i + 1, required));
}

const output = new URL('../../docs/samples.md', import.meta.url);
writeFileSync(
  output,
  `# Sample questions and outputs\n\nRecorded with \`npm run samples\` against the running API on ${new Date().toISOString().slice(0, 10)}. ` +
    `Outputs are unedited; model answers can vary between runs.\n\n${sections.join('\n\n---\n\n')}\n`,
);
console.log(`Wrote ${questions.length} samples to docs/samples.md`);
