# Jokes Collection

A small single-page React app that fetches jokes from the [Official Joke API](https://official-joke-api.appspot.com/), lets you add your own, and remembers your changes between reloads. Built as a test task.

## Run it

Requires **Node 20+** and **Yarn 4** (the repo ships its own PnP setup, so just install Yarn globally — `corepack enable` works).

```bash
yarn install
yarn dev
```

The app starts on http://localhost:5173.

## Other commands

```bash
yarn build     # type-check + production build into dist/
yarn preview   # serve the production build locally
yarn lint      # ESLint
```

## Stack

React 19 · TypeScript · Vite · Redux Toolkit (+ RTK Query) · Material UI 9 · localStorage for persistence.

## Project layout

```
src/
├── components/   UI components
├── store/        Redux store, slice, thunks, RTK Query API
├── lib/          pure helpers (dedup, id, storage adapter, validation)
├── App.tsx       app shell
├── main.tsx      entry point
├── theme.ts      MUI theme
└── types.ts      shared types
```

Design docs and the implementation plan live in [`specs/001-jokes-list/`](./specs/001-jokes-list/) — start with `quickstart.md` if you want a guided tour.
