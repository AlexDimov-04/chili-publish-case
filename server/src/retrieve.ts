import { TOP_K } from './config';
import { embedTexts } from './embed';
import type { Chunk } from './ingest/chunk';
import { searchChunks } from './store';

export interface RetrievedChunk {
  rank: number;
  /** Cosine similarity clipped to [0, 1]: max(0, 1 - cosineDistance). */
  score: number;
  symbol: string;
  apiPath?: string;
  kind: Chunk['kind'];
  file: string;
  lines: [number, number];
  url: string;
  text: string;
}

export interface Retrieval {
  topK: number;
  chunks: RetrievedChunk[];
}

/** Converts LanceDB cosine distance (1 - cos, in [0, 2]) to a similarity score in [0, 1]. */
export function distanceToScore(distance: number): number {
  return Math.min(1, Math.max(0, 1 - distance));
}

/** Ranks already-embedded question vectors against the store; split out so it can be tested without the network. */
export async function retrieveByVector(vector: number[], dbDir?: string): Promise<Retrieval> {
  const results = await searchChunks(vector, TOP_K, dbDir);
  return {
    topK: TOP_K,
    chunks: results.map(({ chunk, distance }, i) => ({
      rank: i + 1,
      score: distanceToScore(distance),
      symbol: chunk.symbol,
      ...(chunk.apiPath && { apiPath: chunk.apiPath }),
      kind: chunk.kind,
      file: chunk.file,
      lines: [chunk.startLine, chunk.endLine],
      url: chunk.url,
      text: chunk.text,
    })),
  };
}

export async function retrieve(question: string): Promise<Retrieval> {
  const { vectors } = await embedTexts([question]);
  return retrieveByVector(vectors[0]);
}
