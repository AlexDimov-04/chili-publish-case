/** 1-based rank of the first expected symbol in the results, or undefined if none was retrieved. */
export function firstHitRank(retrieved: string[], expected: string[]): number | undefined {
  const index = retrieved.findIndex((symbol) => expected.includes(symbol));
  return index === -1 ? undefined : index + 1;
}

export function reciprocalRank(retrieved: string[], expected: string[]): number {
  const rank = firstHitRank(retrieved, expected);
  return rank ? 1 / rank : 0;
}

/** Fraction of expected symbols that appear in the results (all are needed to answer fully). */
export function recall(retrieved: string[], expected: string[]): number {
  return expected.filter((symbol) => retrieved.includes(symbol)).length / expected.length;
}

export function mean(values: number[]): number {
  return values.length === 0 ? 0 : values.reduce((sum, v) => sum + v, 0) / values.length;
}
