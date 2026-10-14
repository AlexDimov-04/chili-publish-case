import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import type { Chunk } from '../src/ingest/chunk';
import { distanceToScore, retrieveByVector } from '../src/retrieve';
import { writeChunks } from '../src/store';

// Seven chunks on a unit circle in 3D: angle i * 20 degrees from the x axis.
const fixture = Array.from({ length: 7 }, (_, i) => {
  const angle = (i * 20 * Math.PI) / 180;
  const chunk: Chunk = {
    id: `method:Widget.m${i}`,
    symbol: `Widget.m${i}`,
    apiPath: `sdk.widget.m${i}`,
    kind: 'method',
    file: 'packages/sdk/src/controllers/WidgetController.ts',
    startLine: i * 10 + 1,
    endLine: i * 10 + 5,
    url: `https://example.test#L${i * 10 + 1}`,
    text: `// sdk.widget.m${i}`,
  };
  return { chunk, vector: [Math.cos(angle), Math.sin(angle), 0] };
});

let dbDir: string;
beforeAll(async () => {
  dbDir = mkdtempSync(join(tmpdir(), 'retrieve-test-'));
  await writeChunks(fixture.map((f) => f.chunk), fixture.map((f) => f.vector), dbDir);
});
afterAll(() => rmSync(dbDir, { recursive: true, force: true }));

describe('retrieveByVector', () => {
  it('returns exactly the top 5 chunks, ranked by similarity', async () => {
    const { topK, chunks } = await retrieveByVector([1, 0, 0], dbDir);
    expect(topK).toBe(5);
    expect(chunks).toHaveLength(5);
    expect(chunks.map((c) => c.symbol)).toEqual(['Widget.m0', 'Widget.m1', 'Widget.m2', 'Widget.m3', 'Widget.m4']);
    expect(chunks.map((c) => c.rank)).toEqual([1, 2, 3, 4, 5]);
  });

  it('scores are cosine similarities in [0, 1], sorted descending', async () => {
    const { chunks } = await retrieveByVector([1, 0, 0], dbDir);
    const scores = chunks.map((c) => c.score);
    expect(scores).toEqual([...scores].sort((a, b) => b - a));
    for (const score of scores) expect(score).toBeGreaterThanOrEqual(0);
    chunks.forEach((c, i) => expect(c.score).toBeCloseTo(Math.cos((i * 20 * Math.PI) / 180), 5));
  });

  it('carries source metadata for transparency', async () => {
    const at75 = (75 * Math.PI) / 180;
    const [top] = (await retrieveByVector([Math.cos(at75), Math.sin(at75), 0], dbDir)).chunks;
    expect(top).toMatchObject({
      symbol: 'Widget.m4',
      apiPath: 'sdk.widget.m4',
      file: 'packages/sdk/src/controllers/WidgetController.ts',
      lines: [41, 45],
      url: 'https://example.test#L41',
    });
  });
});

describe('distanceToScore', () => {
  it('maps cosine distance to clipped similarity', () => {
    expect(distanceToScore(0)).toBe(1);
    expect(distanceToScore(0.25)).toBe(0.75);
    expect(distanceToScore(1)).toBe(0);
    expect(distanceToScore(1.6)).toBe(0);
  });
});
