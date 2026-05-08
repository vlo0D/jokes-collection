import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { SourcedJokePayload } from '@/types';

export const jokesApi = createApi({
  reducerPath: 'jokesApi',
  baseQuery: fetchBaseQuery({
    baseUrl: 'https://official-joke-api.appspot.com',
  }),
  keepUnusedDataFor: 0,
  endpoints: (builder) => ({
    getTenJokes: builder.query<SourcedJokePayload[], void>({
      query: () => '/jokes/ten',
    }),
    getRandomJoke: builder.query<SourcedJokePayload, void>({
      query: () => '/jokes/random',
      transformResponse: (response: SourcedJokePayload | SourcedJokePayload[]) => {
        return Array.isArray(response) ? response[0] : response;
      },
    }),
  }),
});

export const { useGetTenJokesQuery, useGetRandomJokeQuery } = jokesApi;
