import { fileURLToPath } from 'node:url';

// Loads .env from the repo root when present; real env vars take precedence.
try {
  process.loadEnvFile(new URL('../../.env', import.meta.url));
} catch (error) {
  if ((error as NodeJS.ErrnoException).code !== 'ENOENT') throw error;
}

/** Number of chunks retrieved per question (required by the brief). */
export const TOP_K = 5;

/** Studio SDK version: the ingested source tag and the type-check package use the same one. */
export const SDK_VERSION = '1.48.0';

export const EMBEDDING_MODEL = process.env.EMBEDDING_MODEL || 'text-embedding-3-small';
export const PORT = Number(process.env.PORT || 3001);

/** Local data (cloned SDK source, vector store); gitignored. */
export const DATA_DIR = fileURLToPath(new URL('../../data/', import.meta.url));
export const SDK_REPO_URL = 'https://github.com/chili-publish/studio-sdk';
export const SDK_SOURCE_DIR = `${DATA_DIR}studio-sdk`;
