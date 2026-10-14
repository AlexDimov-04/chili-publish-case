import { type TypecheckResult, typecheck } from './check/typecheck';
import { EMBEDDING_MODEL, SDK_VERSION } from './config';
import { type Answer, generate } from './generate';
import { type Retrieval, retrieve } from './retrieve';

export interface AskResponse {
  question: string;
  answer: Answer;
  retrieval: Retrieval;
  /** Result of compiling `answer.code` against the pinned SDK typings; null when no code was generated. */
  typecheck: TypecheckResult | null;
  meta: {
    model: string;
    embeddingModel: string;
    sdkVersion: string;
    latencyMs: { retrieve: number; generate: number; typecheck: number };
    tokens: { input: number; output: number };
  };
}

/** The full RAG pipeline: retrieve the top-k chunks, generate code from them, type-check the code. */
export async function ask(question: string): Promise<AskResponse> {
  let started = performance.now();
  const retrieval = await retrieve(question);
  const retrieveMs = Math.round(performance.now() - started);

  started = performance.now();
  const generation = await generate(question, retrieval.chunks);
  const generateMs = Math.round(performance.now() - started);

  started = performance.now();
  const check = generation.answer.code.trim() ? typecheck(generation.answer.code) : null;
  const typecheckMs = Math.round(performance.now() - started);

  return {
    question,
    answer: generation.answer,
    retrieval,
    typecheck: check,
    meta: {
      model: generation.model,
      embeddingModel: EMBEDDING_MODEL,
      sdkVersion: SDK_VERSION,
      latencyMs: { retrieve: retrieveMs, generate: generateMs, typecheck: typecheckMs },
      tokens: generation.tokens,
    },
  };
}
