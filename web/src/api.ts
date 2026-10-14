// Mirrors the server's AskResponse (server/src/ask.ts); kept separate so the web build has no server imports.
export interface RetrievedChunk {
  rank: number;
  score: number;
  symbol: string;
  apiPath?: string;
  kind: 'method' | 'interface' | 'type' | 'enum';
  file: string;
  lines: [number, number];
  url: string;
  text: string;
}

export interface TypecheckResult {
  ok: boolean;
  errors: { line: number; message: string }[];
}

export interface AskResponse {
  question: string;
  answer: { code: string; explanation: string; usedSymbols: string[] };
  retrieval: { topK: number; chunks: RetrievedChunk[] };
  typecheck?: TypecheckResult;
  meta: {
    model: string;
    embeddingModel: string;
    sdkVersion: string;
    latencyMs: Record<string, number>;
    tokens: { input: number; output: number };
  };
}

export async function askQuestion(question: string, signal?: AbortSignal): Promise<AskResponse> {
  const res = await fetch('/api/ask', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ question }),
    signal,
  });
  const body = await res.json().catch(() => null);
  if (!res.ok) throw new Error(body?.error ?? body?.message ?? `Request failed with status ${res.status}`);
  return body as AskResponse;
}
