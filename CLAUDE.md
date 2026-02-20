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
- `server/src/logging/` — Structured logging with subsystem loggers
- `server/src/lib/` — Shared server utilities
- `server/src/services/` — ConnectRPC service handlers

## Profile Directory

Controlled by `ARFAK_PROFILE` env var (dev default: `$PWD/.arfak`, prod default: `~/.arfak`). Contains two parallel subdirectories:

- `workspace/` — git-tracked authored content (agents, config)
- `state/` — runtime data, never committed (sessions, credentials)

### Configuration (`arfak.toml`)

Loaded at startup from `arfak.toml` at the profile root (not inside `workspace/` — contains sensitive API keys). Hot-reloaded on file changes; invalid configs are rejected and the previous config is kept.

- `[general.logging]` — log level and file path
- `[general.banner]` — optional UI banner with text, link, and color
- `[[models]]` — LLM providers; each entry has `id`, `name`, `vendor`, `model`, `api_key`
- `[[agents]]` — named agents; each entry has `id`, `name`, `model` (must reference a model `id`)

When adding new config fields, add corresponding validation in `validateConfig()` in `server/src/services/config.ts`. Validation runs at startup (fatal) and on hot-reload (aborts reload, keeps old config).

See `.arfak/arfak.toml.example` for a full annotated reference.

## Logging

Use `createSubsystemLogger` for all server logging — never use `console.log` directly.

```typescript
import { createSubsystemLogger } from '../logging/index.js';
const log = createSubsystemLogger('my-subsystem');
log.info('message', { key: 'value' });
```

- **Levels:** `silent | fatal | error | warn | info | debug | trace` (default: `info`)
- **Console:** Pretty with colors (TTY) or compact with ISO timestamps (non-TTY)
- **File:** JSONL to `/tmp/arfak/arfak-YYYY-MM-DD.log` (macOS/Linux)
- **Config:** `[general.logging]` in `arfak.toml` with `level` and `file` (strftime pattern) options, hot-reloaded

## Planning

Write implementation plans to `plans/` directory before starting multi-step tasks.

## CI

GitHub Actions runs `pnpm --filter @arfak/ui test` and `pnpm --filter @arfak/server tsc:check` on push to `main` (Ubuntu, Node 24).
