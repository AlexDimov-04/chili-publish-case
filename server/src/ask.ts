import { EMBEDDING_MODEL, SDK_VERSION } from './config';
import { type Answer, generate } from './generate';
import { type Retrieval, retrieve } from './retrieve';

export interface AskResponse {
  question: string;
  answer: Answer;
  retrieval: Retrieval;
  meta: {
    model: string;
    embeddingModel: string;
    sdkVersion: string;
    latencyMs: { retrieve: number; generate: number };
    tokens: { input: number; output: number };
  };
}

/** The full RAG pipeline: retrieve the top-k chunks, then generate code from them. */
export async function ask(question: string): Promise<AskResponse> {
  let started = performance.now();
  const retrieval = await retrieve(question);
  const retrieveMs = Math.round(performance.now() - started);

  started = performance.now();
  const generation = await generate(question, retrieval.chunks);
  const generateMs = Math.round(performance.now() - started);

  return {
    question,
    answer: generation.answer,
    retrieval,
    meta: {
      model: generation.model,
      embeddingModel: EMBEDDING_MODEL,
      sdkVersion: SDK_VERSION,
      latencyMs: { retrieve: retrieveMs, generate: generateMs },
      tokens: generation.tokens,
    },
  };
}
