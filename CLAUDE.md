# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Structure

Monorepo managed by pnpm workspaces:
- `ui/` — Frontend (React SPA)
- `server/` — Backend (Node.js + ConnectRPC)

## Build & Development Commands

```bash
# UI (from root)
pnpm --filter @arfak/ui dev          # Start Vite dev server with HMR
pnpm --filter @arfak/ui build        # Production build
pnpm --filter @arfak/ui test         # Run ALL checks in parallel (types, tests, lint, format)
pnpm --filter @arfak/ui tsc:check    # TypeScript type checking (uses tsgo)
pnpm --filter @arfak/ui vitest:run   # Run unit tests once
pnpm --filter @arfak/ui lint         # Run oxlint
pnpm --filter @arfak/ui lint:format  # Check formatting (oxfmt)
pnpm --filter @arfak/ui format       # Auto-format code with oxfmt
```

```bash
# Server (from root)
pnpm --filter @arfak/server dev       # Start dev server with watch mode
pnpm --filter @arfak/server gen       # Generate protobuf/ConnectRPC code
pnpm --filter @arfak/server build     # Production build
pnpm --filter @arfak/server tsc:check # TypeScript type checking
```

## Tech Stack

- **Runtime:** React 19, React Router 7, TypeScript 5.9
- **Build:** Vite 7 with Babel React Compiler
- **Styling:** Tailwind CSS 4 (imported via `@import 'tailwindcss'` in `ui/src/App.css`)
- **Package Manager:** pnpm 10+ (Node ≥23)
- **Linting:** Oxlint (extends `@nkzw/oxlint-config`)
- **Formatting:** Oxfmt (single quotes, import sorting, Tailwind class sorting)
- **Testing:** Vitest

## Code Conventions

- **Formatting:** Oxfmt with single quotes, experimental import sorting. Pre-commit hook auto-formats staged files.
- **TypeScript:** Strict mode. Imports must use `.js` extensions for ESM compatibility (e.g., `import { foo } from './bar.js'`).
- **Components:** Functional React components with hooks. Use `@nkzw/stack` `Stack` component for layout.
- **CSS:** Tailwind utility classes. Dark mode via CSS custom properties in `ui/src/App.css`.

## Architecture

- `ui/src/index.tsx` — React DOM entry point
- `ui/src/App.tsx` — Root component with React Router routes and shared layout
- `ui/src/lib/` — Shared utilities
- `ui/src/hooks/` — Custom React hooks (theme management)

## CI

GitHub Actions runs `pnpm --filter @arfak/ui test` and `pnpm --filter @arfak/server tsc:check` on push to `main` (Ubuntu, Node 24).
