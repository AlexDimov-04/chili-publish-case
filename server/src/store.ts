import * as lancedb from '@lancedb/lancedb';
import { CHUNKS_TABLE, VECTOR_DB_DIR } from './config';
import type { Chunk } from './ingest/chunk';

/** A chunk as stored in LanceDB: flat columns, no optional fields (the schema is inferred from rows). */
type ChunkRow = Omit<Chunk, 'apiPath'> & { apiPath: string; vector: number[] };

export interface ScoredChunk {
  chunk: Chunk;
  /** Cosine distance reported by LanceDB, in [0, 2]. */
  distance: number;
}

/** Recreates the chunk table, so ingest is idempotent. */
export async function writeChunks(chunks: Chunk[], vectors: number[][], dbDir = VECTOR_DB_DIR): Promise<void> {
  const db = await lancedb.connect(dbDir);
  const rows: ChunkRow[] = chunks.map((chunk, i) => ({ ...chunk, apiPath: chunk.apiPath ?? '', vector: vectors[i] }));
  await db.createTable(CHUNKS_TABLE, rows, { mode: 'overwrite' });
}

const tables = new Map<string, Promise<lancedb.Table>>();
function openTable(dbDir: string): Promise<lancedb.Table> {
  let table = tables.get(dbDir);
  if (!table) {
    table = lancedb.connect(dbDir).then((db) => db.openTable(CHUNKS_TABLE));
    table.catch(() => tables.delete(dbDir));
    tables.set(dbDir, table);
  }
  return table;
}

/** Exact (brute-force) cosine nearest-neighbour search, closest first. */
export async function searchChunks(vector: number[], limit: number, dbDir = VECTOR_DB_DIR): Promise<ScoredChunk[]> {
  const table = await openTable(dbDir);
  const rows = await table.vectorSearch(vector).distanceType('cosine').limit(limit).toArray();
  return rows.map((row) => ({
    chunk: {
      id: row.id,
      symbol: row.symbol,
      ...(row.apiPath && { apiPath: row.apiPath }),
      kind: row.kind,
      file: row.file,
      startLine: row.startLine,
      endLine: row.endLine,
      url: row.url,
      text: row.text,
    },
    distance: row._distance,
  }));
}
