import { describe, expect, it } from 'vitest';
import { firstHitRank, mean, recall, reciprocalRank } from '../src/eval/metrics';

const retrieved = ['A', 'B', 'C', 'D', 'E'];

describe('eval metrics', () => {
  it('ranks the first expected symbol', () => {
    expect(firstHitRank(retrieved, ['C', 'B'])).toBe(2);
    expect(firstHitRank(retrieved, ['Z'])).toBeUndefined();
  });

  it('computes reciprocal rank', () => {
    expect(reciprocalRank(retrieved, ['A'])).toBe(1);
    expect(reciprocalRank(retrieved, ['D'])).toBe(0.25);
    expect(reciprocalRank(retrieved, ['Z'])).toBe(0);
  });

  it('computes recall over all expected symbols', () => {
    expect(recall(retrieved, ['A', 'Z'])).toBe(0.5);
    expect(recall(retrieved, ['A', 'E'])).toBe(1);
  });

  it('averages, with 0 for no values', () => {
    expect(mean([1, 0, 0.5])).toBe(0.5);
    expect(mean([])).toBe(0);
  });
});
