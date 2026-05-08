import type { UserJokeRecord } from '@/types';

export const STORAGE_KEY = 'jokesCollection.userJokes.v1';

export class StorageWriteError extends Error {
  public readonly cause: unknown;
  constructor(cause: unknown) {
    super('Failed to persist user jokes');
    this.name = 'StorageWriteError';
    this.cause = cause;
  }
}

function normalizeRecord(r: unknown): UserJokeRecord | null {
  if (typeof r !== 'object' || r === null) return null;
  const o = r as Record<string, unknown>;
  if (
    typeof o.localId !== 'string' ||
    typeof o.setup !== 'string' ||
    typeof o.punchline !== 'string' ||
    typeof o.createdAt !== 'number' ||
    o.localId.length === 0 ||
    o.setup.length === 0 ||
    o.punchline.length === 0
  ) {
    return null;
  }
  const type =
    typeof o.type === 'string' && o.type.length > 0 ? o.type : null;
  return {
    localId: o.localId,
    setup: o.setup,
    punchline: o.punchline,
    type,
    createdAt: o.createdAt,
  };
}

export const userJokesStorage = {
  read(): UserJokeRecord[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw === null) return [];
      const parsed: unknown = JSON.parse(raw);
      if (!Array.isArray(parsed)) {
        console.error('[userJokesStorage] stored value is not an array; resetting');
        return [];
      }
      const records: UserJokeRecord[] = [];
      for (const item of parsed) {
        const normalized = normalizeRecord(item);
        if (normalized !== null) records.push(normalized);
      }
      return records;
    } catch (err) {
      console.error('[userJokesStorage] failed to read', err);
      return [];
    }
  },

  write(records: UserJokeRecord[]): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
    } catch (err) {
      throw new StorageWriteError(err);
    }
  },

  clear(): void {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (err) {
      console.error('[userJokesStorage] failed to clear', err);
    }
  },
};
