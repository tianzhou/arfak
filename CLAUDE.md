# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Build & Development Commands

```bash
pnpm dev              # Start Vite dev server with HMR
pnpm build            # Production build
pnpm test             # Run ALL checks in parallel (types, tests, lint, format)
pnpm tsc:check        # TypeScript type checking (uses tsgo)
pnpm vitest:run       # Run unit tests once
pnpm lint             # Run oxlint
pnpm lint:format      # Check formatting (oxfmt)
pnpm format           # Auto-format code with oxfmt
```

## Tech Stack

- **Runtime:** React 19, React Router 7, TypeScript 5.9
- **Build:** Vite 7 with Babel React Compiler
- **Styling:** Tailwind CSS 4 (imported via `@import 'tailwindcss'` in `src/App.css`)
- **Auth:** Better Auth (client in `src/user/AuthClient.tsx`, requires separate server at `VITE_SERVER_URL`)
- **Package Manager:** pnpm 10+ (Node ≥23)
- **Linting:** Oxlint (extends `@nkzw/oxlint-config`)
- **Formatting:** Oxfmt (single quotes, import sorting, Tailwind class sorting)
- **Testing:** Vitest

## Code Conventions

- **Formatting:** Oxfmt with single quotes, experimental import sorting. Pre-commit hook auto-formats staged files.
- **TypeScript:** Strict mode. Imports must use `.js` extensions for ESM compatibility (e.g., `import { foo } from './bar.js'`).
- **Components:** Functional React components with hooks. Use `@nkzw/stack` `Stack` component for layout.
- **Environment variables:** Access via `src/lib/env.tsx` wrapper (uses `@nkzw/define-env`), not `import.meta.env` directly.
- **CSS:** Tailwind utility classes. Dark mode via CSS custom properties in `src/App.css`.

## Architecture

- `src/index.tsx` — React DOM entry point
- `src/App.tsx` — Root component with React Router routes and shared layout
- `src/lib/` — Shared utilities (env config)
- `src/user/` — Authentication module (Better Auth client, sign-in UI)

## CI

GitHub Actions runs `pnpm test` on push to `main` (Ubuntu, Node 24).
