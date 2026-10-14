import { readFileSync } from 'node:fs';
import { zodTextFormat } from 'openai/helpers/zod';
import { z } from 'zod';
import { CHAT_MODEL, SDK_VERSION } from './config';
import { openai } from './embed';
import type { RetrievedChunk } from './retrieve';

export const Answer = z.object({
  code: z.string(),
  explanation: z.string(),
  usedSymbols: z.array(z.string()),
});
export type Answer = z.infer<typeof Answer>;

export interface Generation {
  answer: Answer;
  model: string;
  tokens: { input: number; output: number };
}

const instructions = readFileSync(new URL('../prompts/generate-code.md', import.meta.url), 'utf8').replaceAll(
  '{{sdkVersion}}',
  SDK_VERSION,
);

export function buildContext(chunks: RetrievedChunk[]): string {
  return chunks
    .map((chunk) => `### Context ${chunk.rank}: ${chunk.symbol} (${chunk.file}:${chunk.lines.join('-')})\n${chunk.text}`)
    .join('\n\n');
}

/** Generates a TypeScript answer grounded in the retrieved chunks, as schema-validated JSON. */
export async function generate(question: string, chunks: RetrievedChunk[]): Promise<Generation> {
  const response = await openai().responses.parse({
    model: CHAT_MODEL,
    instructions,
    input: `# Context\n\n${buildContext(chunks)}\n\n# Question\n\n${question}`,
    text: { format: zodTextFormat(Answer, 'answer') },
  });
  if (!response.output_parsed) throw new Error(`Model returned no parsable answer (status: ${response.status})`);
  return {
    answer: response.output_parsed,
    model: response.model,
    tokens: { input: response.usage?.input_tokens ?? 0, output: response.usage?.output_tokens ?? 0 },
  };
}
