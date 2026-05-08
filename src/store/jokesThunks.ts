import { createAsyncThunk } from '@reduxjs/toolkit';
import { jokesActions } from './jokesSlice';
import { jokesApi } from '@/store/jokesApi';
import { userJokesStorage, StorageWriteError } from '@/lib/userJokesStorage';
import { sourcedJokeId, userJokeId, newUserJokeLocalId } from '@/lib/id';
import { sourcedIdSet, isValidPayload, pickUniquePayloads } from '@/lib/dedup';
import { validateAddJokeInput } from '@/lib/validateAddJokeInput';
import type { Joke, SourcedJokePayload, UserJokeRecord } from '@/types';
import type { RootState, AppDispatch } from '@/store';

const BATCH_SIZE = 10;
const MAX_RETRIES = 5;
const GENERIC_NETWORK_ERROR =
  "Couldn't reach the jokes service. Please check your connection and try again.";
const STORAGE_FULL_ERROR =
  "Couldn't save the joke locally. Free up some space and try again.";

interface ThunkConfig {
  state: RootState;
  dispatch: AppDispatch;
}

function userRecordToJoke(record: UserJokeRecord): Joke {
  return {
    id: userJokeId(record.localId),
    origin: 'user',
    sourceId: null,
    localId: record.localId,
    setup: record.setup,
    punchline: record.punchline,
    type: record.type,
    createdAt: record.createdAt,
  };
}

function payloadToJoke(payload: SourcedJokePayload): Joke {
  return {
    id: sourcedJokeId(payload.id),
    origin: 'source',
    sourceId: payload.id,
    localId: null,
    setup: payload.setup,
    punchline: payload.punchline,
    type: payload.type,
    createdAt: null,
  };
}

function jokeToUserRecord(joke: Joke): UserJokeRecord | null {
  if (joke.origin !== 'user' || joke.localId === null || joke.createdAt === null) {
    return null;
  }
  return {
    localId: joke.localId,
    setup: joke.setup,
    punchline: joke.punchline,
    type: joke.type,
    createdAt: joke.createdAt,
  };
}

async function fetchTenJokes(dispatch: AppDispatch): Promise<SourcedJokePayload[]> {
  const result = await dispatch(
    jokesApi.endpoints.getTenJokes.initiate(undefined, { forceRefetch: true }),
  );
  if (result.error !== undefined) {
    throw new Error(GENERIC_NETWORK_ERROR);
  }
  if (!Array.isArray(result.data)) return [];
  return result.data.filter(isValidPayload);
}

async function fetchRandomJoke(dispatch: AppDispatch): Promise<SourcedJokePayload | null> {
  const result = await dispatch(
    jokesApi.endpoints.getRandomJoke.initiate(undefined, { forceRefetch: true }),
  );
  if (result.error !== undefined) {
    throw new Error(GENERIC_NETWORK_ERROR);
  }
  return isValidPayload(result.data) ? result.data : null;
}

export const initializeJokes = createAsyncThunk<void, void, ThunkConfig>(
  'jokes/initialize',
  async (_arg, { dispatch }) => {
    dispatch(jokesActions.setStatus('loading'));
    dispatch(jokesActions.setError(null));

    const userRecords = userJokesStorage.read();
    const userJokes = userRecords.map(userRecordToJoke);
    dispatch(jokesActions.setItems(userJokes));

    if (userJokes.length >= BATCH_SIZE) {
      dispatch(jokesActions.setStatus('idle'));
      return;
    }

    try {
      const fetched = await fetchTenJokes(dispatch);
      const excluded = sourcedIdSet(userJokes);
      const need = BATCH_SIZE - userJokes.length;
      const unique = pickUniquePayloads(fetched, excluded, need);
      dispatch(jokesActions.appendItems(unique.map(payloadToJoke)));
      dispatch(jokesActions.setStatus('idle'));
    } catch (err) {
      const message = err instanceof Error ? err.message : GENERIC_NETWORK_ERROR;
      dispatch(jokesActions.setError(message));
      dispatch(jokesActions.setStatus('error'));
    }
  },
  {
    condition: (_arg, { getState }) => {
      const s = getState().jokes;
      return s.status !== 'loading' && s.items.length === 0;
    },
  },
);

export const loadMoreJokes = createAsyncThunk<void, void, ThunkConfig>(
  'jokes/loadMore',
  async (_arg, { dispatch, getState }) => {
    dispatch(jokesActions.setStatus('loading'));
    dispatch(jokesActions.setError(null));

    const seen = sourcedIdSet(getState().jokes.items);
    const collected: SourcedJokePayload[] = [];

    try {
      for (let attempt = 0; attempt <= MAX_RETRIES; attempt += 1) {
        const fetched = await fetchTenJokes(dispatch);
        const need = BATCH_SIZE - collected.length;
        const fresh = pickUniquePayloads(fetched, seen, need);
        collected.push(...fresh);
        if (collected.length >= BATCH_SIZE) break;
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : GENERIC_NETWORK_ERROR;
      dispatch(jokesActions.setError(message));
      dispatch(jokesActions.setStatus('error'));
      return;
    }

    if (collected.length === 0) {
      dispatch(jokesActions.setNoMoreJokes(true));
      dispatch(jokesActions.setStatus('idle'));
      return;
    }

    dispatch(jokesActions.appendItems(collected.map(payloadToJoke)));
    if (collected.length < BATCH_SIZE) {
      dispatch(jokesActions.setNoMoreJokes(true));
    }
    dispatch(jokesActions.setStatus('idle'));
  },
  {
    condition: (_arg, { getState }) => getState().jokes.status !== 'loading',
  },
);

export const retryAfterError = createAsyncThunk<void, void, ThunkConfig>(
  'jokes/retryAfterError',
  async (_arg, { dispatch, getState }) => {
    if (getState().jokes.items.length === 0) {
      await dispatch(initializeJokes());
    } else {
      await dispatch(loadMoreJokes());
    }
  },
);

export const addUserJoke = createAsyncThunk<
  void,
  { setup: string; punchline: string; type?: string | null },
  ThunkConfig
>('jokes/add', async (input, { dispatch, getState }) => {
  const validation = validateAddJokeInput({
    setup: input.setup,
    punchline: input.punchline,
    type: input.type ?? undefined,
  });
  if (!validation.ok) {
    return;
  }

  const record: UserJokeRecord = {
    localId: newUserJokeLocalId(),
    setup: validation.cleaned.setup,
    punchline: validation.cleaned.punchline,
    type: validation.cleaned.type,
    createdAt: Date.now(),
  };
  const newJoke = userRecordToJoke(record);

  dispatch(jokesActions.prependItem(newJoke));

  const userRecords: UserJokeRecord[] = [];
  for (const item of getState().jokes.items) {
    const r = jokeToUserRecord(item);
    if (r !== null) userRecords.push(r);
  }

  try {
    userJokesStorage.write(userRecords);
    dispatch(jokesActions.closeAddDialog());
  } catch (err) {
    dispatch(jokesActions.removeItemById(newJoke.id));
    if (err instanceof StorageWriteError) {
      dispatch(jokesActions.setError(STORAGE_FULL_ERROR));
    } else {
      dispatch(jokesActions.setError(STORAGE_FULL_ERROR));
    }
  }
});

export const deleteJoke = createAsyncThunk<void, { id: string }, ThunkConfig>(
  'jokes/delete',
  async ({ id }, { dispatch, getState }) => {
    const before = getState().jokes.items;
    const target = before.find((j) => j.id === id);
    dispatch(jokesActions.removeItemById(id));

    if (target?.origin === 'user') {
      const after = getState().jokes.items;
      const userRecords: UserJokeRecord[] = [];
      for (const item of after) {
        const r = jokeToUserRecord(item);
        if (r !== null) userRecords.push(r);
      }
      try {
        userJokesStorage.write(userRecords);
      } catch (err) {
        console.error('[deleteJoke] failed to persist after delete', err);
      }
    }
  },
);

export const refreshJoke = createAsyncThunk<void, { id: string }, ThunkConfig>(
  'jokes/refresh',
  async ({ id }, { dispatch, getState }) => {
    dispatch(jokesActions.startRefreshing(id));
    try {
      const items = getState().jokes.items;
      const targetIndex = items.findIndex((j) => j.id === id);
      if (targetIndex === -1) return;
      const target = items[targetIndex];

      const seen = new Set<number>();
      for (const j of items) {
        if (j.origin === 'source' && j.sourceId !== null && j.id !== target.id) {
          seen.add(j.sourceId);
        }
      }

      let replacement: SourcedJokePayload | null = null;
      for (let attempt = 0; attempt <= MAX_RETRIES; attempt += 1) {
        const candidate = await fetchRandomJoke(dispatch);
        if (candidate === null) continue;
        if (seen.has(candidate.id)) continue;
        replacement = candidate;
        break;
      }

      if (replacement === null) {
        dispatch(
          jokesActions.setError(
            "Couldn't find a fresh joke — please try Refresh again in a moment.",
          ),
        );
        return;
      }

      const currentIndex = getState().jokes.items.findIndex((j) => j.id === id);
      if (currentIndex === -1) return;
      dispatch(
        jokesActions.replaceItemAt({
          index: currentIndex,
          item: payloadToJoke(replacement),
        }),
      );
    } catch (err) {
      const message = err instanceof Error ? err.message : GENERIC_NETWORK_ERROR;
      dispatch(jokesActions.setError(message));
    } finally {
      dispatch(jokesActions.stopRefreshing(id));
    }
  },
);
