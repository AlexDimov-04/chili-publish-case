import { describe, expect, it, vi } from 'vitest';
import { buildApp } from '../src/app';
import type { AskResponse } from '../src/ask';

const fakeResponse = (question: string): AskResponse => ({
  question,
  answer: { code: 'await sdk.page.getSnapshot();', explanation: 'x', usedSymbols: ['PageController.getSnapshot'] },
  retrieval: { topK: 5, chunks: [] },
  typecheck: { ok: true, errors: [] },
  meta: {
    model: 'm',
    embeddingModel: 'e',
    sdkVersion: '1.0.0',
    latencyMs: { retrieve: 1, generate: 2, typecheck: 3 },
    tokens: { input: 3, output: 4 },
  },
});

function appWith(overrides: Partial<Parameters<typeof buildApp>[0]> = {}) {
  return buildApp({ ask: async (q) => fakeResponse(q), countChunks: async () => 860, ...overrides }, false);
}

describe('POST /api/ask', () => {
  it('trims the question and returns the pipeline response', async () => {
    const ask = vi.fn(async (q: string) => fakeResponse(q));
    const res = await appWith({ ask }).inject({ method: 'POST', url: '/api/ask', payload: { question: '  snapshot  ' } });
    expect(res.statusCode).toBe(200);
    expect(ask).toHaveBeenCalledWith('snapshot');
    expect(res.json().question).toBe('snapshot');
  });

  it.each([{}, { question: '' }, { question: '   ' }, { question: 42 }, { question: 'x'.repeat(1001) }])(
    'rejects invalid body %j with 400 without calling the pipeline',
    async (payload) => {
      const ask = vi.fn();
      const res = await appWith({ ask }).inject({ method: 'POST', url: '/api/ask', payload });
      expect(res.statusCode).toBe(400);
      expect(ask).not.toHaveBeenCalled();
    },
  );
});

describe('GET /api/health', () => {
  it('reports ok with the chunk count', async () => {
    const res = await appWith().inject({ method: 'GET', url: '/api/health' });
    expect(res.statusCode).toBe(200);
    expect(res.json()).toMatchObject({ status: 'ok', chunks: 860 });
  });

  it('reports 503 when the vector store is missing', async () => {
    const res = await appWith({ countChunks: async () => { throw new Error('no table'); } }).inject({ method: 'GET', url: '/api/health' });
    expect(res.statusCode).toBe(503);
  });
});
