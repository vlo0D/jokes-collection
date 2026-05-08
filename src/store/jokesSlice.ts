import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { Joke, JokesStatus } from '@/types';

export interface JokesState {
  items: Joke[];
  status: JokesStatus;
  error: string | null;
  noMoreJokes: boolean;
  refreshingIds: string[];
  isAddOpen: boolean;
}

const initialState: JokesState = {
  items: [],
  status: 'idle',
  error: null,
  noMoreJokes: false,
  refreshingIds: [],
  isAddOpen: false,
};

function existingIdSet(items: Joke[], excludeIndex: number = -1): Set<string> {
  const set = new Set<string>();
  items.forEach((j, i) => {
    if (i !== excludeIndex) set.add(j.id);
  });
  return set;
}

const jokesSlice = createSlice({
  name: 'jokes',
  initialState,
  reducers: {
    setItems(state, action: PayloadAction<Joke[]>) {
      const seen = new Set<string>();
      const unique: Joke[] = [];
      for (const j of action.payload) {
        if (seen.has(j.id)) {
          console.error('[jokesSlice.setItems] duplicate id dropped:', j.id);
          continue;
        }
        seen.add(j.id);
        unique.push(j);
      }
      state.items = unique;
    },
    appendItems(state, action: PayloadAction<Joke[]>) {
      const seen = existingIdSet(state.items);
      for (const j of action.payload) {
        if (seen.has(j.id)) {
          console.error('[jokesSlice.appendItems] duplicate id dropped:', j.id);
          continue;
        }
        seen.add(j.id);
        state.items.push(j);
      }
    },
    prependItem(state, action: PayloadAction<Joke>) {
      const seen = existingIdSet(state.items);
      if (seen.has(action.payload.id)) {
        console.error('[jokesSlice.prependItem] duplicate id dropped:', action.payload.id);
        return;
      }
      state.items.unshift(action.payload);
    },
    replaceItemAt(state, action: PayloadAction<{ index: number; item: Joke }>) {
      const { index, item } = action.payload;
      if (index < 0 || index >= state.items.length) {
        console.error('[jokesSlice.replaceItemAt] index out of range:', index);
        return;
      }
      const seen = existingIdSet(state.items, index);
      if (seen.has(item.id)) {
        console.error('[jokesSlice.replaceItemAt] duplicate id dropped:', item.id);
        return;
      }
      state.items[index] = item;
    },
    removeItemById(state, action: PayloadAction<string>) {
      state.items = state.items.filter((j) => j.id !== action.payload);
    },
    setStatus(state, action: PayloadAction<JokesStatus>) {
      state.status = action.payload;
    },
    setError(state, action: PayloadAction<string | null>) {
      state.error = action.payload;
    },
    setNoMoreJokes(state, action: PayloadAction<boolean>) {
      state.noMoreJokes = action.payload;
    },
    startRefreshing(state, action: PayloadAction<string>) {
      if (!state.refreshingIds.includes(action.payload)) {
        state.refreshingIds.push(action.payload);
      }
    },
    stopRefreshing(state, action: PayloadAction<string>) {
      state.refreshingIds = state.refreshingIds.filter((id) => id !== action.payload);
    },
    openAddDialog(state) {
      state.isAddOpen = true;
    },
    closeAddDialog(state) {
      state.isAddOpen = false;
    },
  },
});

export const jokesActions = jokesSlice.actions;
export const jokesReducer = jokesSlice.reducer;

export interface RootStateLike {
  jokes: JokesState;
}

export const selectAllJokes = (s: RootStateLike): Joke[] => s.jokes.items;
export const selectJokesStatus = (s: RootStateLike): JokesStatus => s.jokes.status;
export const selectJokesError = (s: RootStateLike): string | null => s.jokes.error;
export const selectNoMoreJokes = (s: RootStateLike): boolean => s.jokes.noMoreJokes;
export const selectRefreshingIds = (s: RootStateLike): string[] => s.jokes.refreshingIds;
export const selectIsRefreshing = (s: RootStateLike, id: string): boolean =>
  s.jokes.refreshingIds.includes(id);
export const selectIsAddOpen = (s: RootStateLike): boolean => s.jokes.isAddOpen;
export const selectCanLoadMore = (s: RootStateLike): boolean =>
  s.jokes.status === 'idle' && !s.jokes.noMoreJokes;
