import OpenAI from 'openai';
import { EMBEDDING_MODEL, requireOpenAiKey } from './config';

const BATCH_SIZE = 100;

let client: OpenAI | undefined;
export function openai(): OpenAI {
  client ??= new OpenAI({ apiKey: requireOpenAiKey() });
  return client;
}

/** Embeds texts in batches, preserving order. */
export async function embedTexts(texts: string[]): Promise<{ vectors: number[][]; tokens: number }> {
  const vectors: number[][] = [];
  let tokens = 0;
  for (let i = 0; i < texts.length; i += BATCH_SIZE) {
    const response = await openai().embeddings.create({ model: EMBEDDING_MODEL, input: texts.slice(i, i + BATCH_SIZE) });
    vectors.push(...response.data.sort((a, b) => a.index - b.index).map((item) => item.embedding));
    tokens += response.usage.prompt_tokens;
  }
  return { vectors, tokens };
}
