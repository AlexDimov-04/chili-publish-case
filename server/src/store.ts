import * as lancedb from '@lancedb/lancedb';
import { CHUNKS_TABLE, VECTOR_DB_DIR } from './config';
import type { Chunk } from './ingest/chunk';

/** A chunk as stored in LanceDB: flat columns, no optional fields (the schema is inferred from rows). */
type ChunkRow = Omit<Chunk, 'apiPath'> & { apiPath: string; vector: number[] };

/** Recreates the chunk table, so ingest is idempotent. */
export async function writeChunks(chunks: Chunk[], vectors: number[][]): Promise<void> {
  const db = await lancedb.connect(VECTOR_DB_DIR);
  const rows: ChunkRow[] = chunks.map((chunk, i) => ({ ...chunk, apiPath: chunk.apiPath ?? '', vector: vectors[i] }));
  await db.createTable(CHUNKS_TABLE, rows, { mode: 'overwrite' });
}
