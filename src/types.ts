export type JokeOrigin = 'user' | 'source';

export type JokesStatus = 'idle' | 'loading' | 'error';

export interface Joke {
  id: string;
  origin: JokeOrigin;
  sourceId: number | null;
  localId: string | null;
  setup: string;
  punchline: string;
  type: string | null;
  createdAt: number | null;
}

export interface SourcedJokePayload {
  id: number;
  type: string;
  setup: string;
  punchline: string;
}

export interface UserJokeRecord {
  localId: string;
  setup: string;
  punchline: string;
  type: string | null;
  createdAt: number;
}
