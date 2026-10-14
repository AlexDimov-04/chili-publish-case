import { EMBEDDING_MODEL, SDK_VERSION, VECTOR_DB_DIR } from '../config';
import { embedTexts } from '../embed';
import { writeChunks } from '../store';
import { chunkSdk } from './chunk';
import { fetchSdkSource } from './fetch-sdk';

const started = performance.now();
const repoRoot = await fetchSdkSource();
const chunks = chunkSdk(repoRoot);
const { vectors, tokens } = await embedTexts(chunks.map((chunk) => chunk.text));
await writeChunks(chunks, vectors);

const counts = Object.groupBy(chunks, (chunk) => chunk.kind);
console.log(
  `Ingested studio-sdk ${SDK_VERSION}: ${chunks.length} chunks ` +
    `(${Object.entries(counts).map(([kind, list]) => `${list!.length} ${kind}`).join(', ')}), ` +
    `${tokens} tokens with ${EMBEDDING_MODEL}, ${((performance.now() - started) / 1000).toFixed(1)}s -> ${VECTOR_DB_DIR}`,
);
