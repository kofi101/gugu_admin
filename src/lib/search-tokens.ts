/**
 * Prefix tokens per word for Firestore array-contains search, matching the
 * mobile app's `advanceSearchableValues` convention.
 */
export function searchTokens(...texts: string[]): string[] {
  const tokens = new Set<string>();
  for (const text of texts) {
    const words = text
      .toLowerCase()
      .normalize('NFKD')
      .replace(/\p{M}/gu, '')
      .replace(/[^\p{L}\p{N}\s]/gu, ' ')
      .split(/\s+/)
      .filter(Boolean);
    for (const word of words) {
      for (let i = 1; i <= Math.min(word.length, 20); i++) tokens.add(word.slice(0, i));
    }
  }
  return Array.from(tokens).slice(0, 200);
}
