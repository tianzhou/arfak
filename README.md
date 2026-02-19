# Arfak

AI assistance, made personal.

## Structure

| Directory  | Description                                               |
| ---------- | --------------------------------------------------------- |
| `ui/`      | React SPA — Vite 7, Tailwind CSS 4, React Router 7        |
| `server/`  | Node.js backend — ConnectRPC services, structured logging |
| `website/` | Next.js marketing site                                    |

## Getting Started

```bash
pnpm install

# Start the UI dev server
pnpm --filter @arfak/ui dev

# Start the backend dev server
pnpm --filter @arfak/server dev
```

## Scripts

```bash
pnpm --filter @arfak/ui test       # Run type checks, tests, lint, and format checks
pnpm --filter @arfak/server gen    # Generate protobuf/ConnectRPC code
```
