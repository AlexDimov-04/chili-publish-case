import { buildApp } from './app';
import { ask } from './ask';
import { PORT } from './config';
import { countChunks } from './store';

const app = buildApp({ ask, countChunks });
await app.listen({ port: PORT, host: '127.0.0.1' });
