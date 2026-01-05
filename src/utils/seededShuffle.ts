// Mulberry32 - a simple but decent PRNG
function mulberry32(a: number) {
  return function () {
    let t = (a += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), 1 | t);
    t ^= t + Math.imul(t ^ (t >>> 7), 61 | t);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Shuffle an array using Fisher-Yates algorithm with a seeded random number generator.
 * Same seed will always produce the same shuffle order.
 */
export function seededShuffle<T>(array: T[], seed: string): T[] {
  const result = [...array];

  // Convert seed string to number
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    const char = seed.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }

  const rng = mulberry32(Math.abs(hash));

  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }

  return result;
}

/**
 * Generate a random seed string based on current timestamp.
 * Can be stored to reproduce same shuffle later.
 */
export function generateSeed(): string {
  return Date.now().toString() + Math.random().toString(36).substring(2);
}
