import Fastify, { type FastifyInstance } from 'fastify';
import { z } from 'zod';
import type { AskResponse } from './ask';
import { CHAT_MODEL, MAX_QUESTION_LENGTH, SDK_VERSION } from './config';

const AskRequest = z.object({ question: z.string().trim().min(1).max(MAX_QUESTION_LENGTH) });

export interface AppDeps {
  ask: (question: string) => Promise<AskResponse>;
  /** Number of indexed chunks; throws if the vector store is not ready. */
  countChunks: () => Promise<number>;
}

export function buildApp(deps: AppDeps, logger: boolean = true): FastifyInstance {
  const app = Fastify({ logger });

  app.get('/api/health', async (_request, reply) => {
    try {
      const chunks = await deps.countChunks();
      return { status: 'ok', sdkVersion: SDK_VERSION, model: CHAT_MODEL, chunks };
    } catch {
      return reply.code(503).send({ status: 'unavailable', error: 'Vector store not ready; run `npm run ingest`.' });
    }
  });

  app.post('/api/ask', async (request, reply) => {
    const parsed = AskRequest.safeParse(request.body);
    if (!parsed.success) {
      return reply.code(400).send({ error: 'Invalid request', issues: z.flattenError(parsed.error).fieldErrors });
    }
    const response = await deps.ask(parsed.data.question);
    request.log.info(
      {
        event: 'ask',
        model: response.meta.model,
        latencyMs: response.meta.latencyMs,
        tokens: response.meta.tokens,
        topSymbols: response.retrieval.chunks.map((chunk) => chunk.symbol),
      },
      'answered question',
    );
    return response;
  });

  return app;
}
