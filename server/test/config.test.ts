import { describe, expect, it } from 'vitest';
import { SDK_VERSION, TOP_K } from '../src/config';

describe('config', () => {
  it('retrieves exactly 5 chunks per question', () => {
    expect(TOP_K).toBe(5);
  });

  it('pins an exact SDK version', () => {
    expect(SDK_VERSION).toMatch(/^\d+\.\d+\.\d+$/);
  });
});
