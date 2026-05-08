import type { Joke, SourcedJokePayload } from '@/types';

export function sourcedIdSet(items: Joke[]): Set<number> {
  const set = new Set<number>();
  for (const j of items) {
    if (j.origin === 'source' && j.sourceId !== null) {
      set.add(j.sourceId);
    }
  }
  return set;
}

export function isValidPayload(p: unknown): p is SourcedJokePayload {
  if (typeof p !== 'object' || p === null) return false;
  const r = p as Record<string, unknown>;
  return (
    typeof r.id === 'number' &&
    typeof r.type === 'string' &&
    typeof r.setup === 'string' &&
    typeof r.punchline === 'string' &&
    r.setup.length > 0 &&
    r.punchline.length > 0
  );
}

export function pickUniquePayloads(
  payloads: readonly SourcedJokePayload[],
  excluded: Set<number>,
  limit: number,
): SourcedJokePayload[] {
  const picked: SourcedJokePayload[] = [];
  for (const p of payloads) {
    if (picked.length >= limit) break;
    if (excluded.has(p.id)) continue;
    picked.push(p);
    excluded.add(p.id);
  }
  return picked;
}
