# Session Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add session CRUD and message persistence so agents can have multiple concurrent conversations displayed as tabs.

**Architecture:** Five new ConnectRPC endpoints backed by filesystem storage. Sessions stored as directories under `state/agents/{id}/sessions/{session-id}/` with `meta.json` + `messages.jsonl`. UI adds tab bar to ChatPage with `useSessions` and `useMessages` hooks following the existing `useSyncExternalStore` pattern.

**Tech Stack:** Protobuf/ConnectRPC, Node.js fs, UUIDv7, React `useSyncExternalStore`, base-ui Tabs component.

---

### Task 1: Add UUIDv7 Dependency

**Files:**

- Modify: `server/package.json`

**Step 1: Install uuidv7**

Run: `pnpm --filter @arfak/server add uuidv7`

**Step 2: Commit**

```bash
git add server/package.json server/pnpm-lock.yaml
git commit -m "deps(server): add uuidv7 for time-ordered unique IDs"
```

---

### Task 2: Add Session and Message Protobuf Definitions

**Files:**

- Modify: `server/proto/arfak/v1/service.proto`

**Step 1: Add messages and RPCs to service.proto**

Append to the `ArfakService` block and add new messages. The full file should become:

```protobuf
syntax = "proto3";

package arfak.v1;

service ArfakService {
  rpc Ping(PingRequest) returns (PingResponse);
  rpc GetConfig(GetConfigRequest) returns (GetConfigResponse);
  rpc ListModels(ListModelsRequest) returns (ListModelsResponse);
  rpc ListAgents(ListAgentsRequest) returns (ListAgentsResponse);
  rpc CreateSession(CreateSessionRequest) returns (CreateSessionResponse);
  rpc ListSessions(ListSessionsRequest) returns (ListSessionsResponse);
  rpc DeleteSession(DeleteSessionRequest) returns (DeleteSessionResponse);
  rpc SendMessage(SendMessageRequest) returns (SendMessageResponse);
  rpc ListMessages(ListMessagesRequest) returns (ListMessagesResponse);
}

// --- existing messages stay unchanged ---

message Session {
  string id = 1;
  string agent_id = 2;
  string title = 3;
  string created_at = 4;
  string updated_at = 5;
}

message ChatMessage {
  string id = 1;
  string session_id = 2;
  string role = 3;
  string content = 4;
  string created_at = 5;
}

message CreateSessionRequest {
  string agent_id = 1;
}

message CreateSessionResponse {
  Session session = 1;
}

message ListSessionsRequest {
  string agent_id = 1;
}

message ListSessionsResponse {
  repeated Session sessions = 1;
}

message DeleteSessionRequest {
  string agent_id = 1;
  string session_id = 2;
}

message DeleteSessionResponse {}

message SendMessageRequest {
  string agent_id = 1;
  string session_id = 2;
  string role = 3;
  string content = 4;
}

message SendMessageResponse {
  ChatMessage message = 1;
}

message ListMessagesRequest {
  string agent_id = 1;
  string session_id = 2;
}

message ListMessagesResponse {
  repeated ChatMessage messages = 1;
}
```

Note: Use `ChatMessage` instead of `Message` to avoid collision with protobuf's built-in `Message` type.

**Step 2: Regenerate TypeScript from proto**

Run: `pnpm --filter @arfak/server gen`

**Step 3: Verify generated code compiles**

Run: `pnpm --filter @arfak/server tsc:check`
Expected: PASS (no type errors)

**Step 4: Commit**

```bash
git add server/proto/ server/src/gen/
git commit -m "proto: add Session, ChatMessage, and 5 session/message RPCs"
```

---

### Task 3: Implement Session Filesystem Operations

**Files:**

- Modify: `server/src/lib/profile.ts`

**Step 1: Add session directory helpers**

Add to `server/src/lib/profile.ts`:

```typescript
import { uuidv7 } from 'uuidv7';

export function getSessionsDir(agentId: string): string {
  return path.join(getAgentStateDir(agentId), 'sessions');
}

export function getSessionDir(agentId: string, sessionId: string): string {
  return path.join(getSessionsDir(agentId), sessionId);
}
```

**Step 2: Add createSession**

```typescript
interface SessionMeta {
  title: string;
  created_at: string;
  updated_at: string;
}

export function createSession(agentId: string): {
  id: string;
  agentId: string;
  title: string;
  createdAt: string;
  updatedAt: string;
} {
  const id = uuidv7();
  const now = new Date().toISOString();
  const dir = getSessionDir(agentId, id);
  fs.mkdirSync(dir, { recursive: true });
  const meta: SessionMeta = { title: 'New session', created_at: now, updated_at: now };
  fs.writeFileSync(path.join(dir, 'meta.json'), JSON.stringify(meta));
  return { id, agentId, title: meta.title, createdAt: now, updatedAt: now };
}
```

**Step 3: Add listSessions**

```typescript
export function listSessions(
  agentId: string,
): { id: string; agentId: string; title: string; createdAt: string; updatedAt: string }[] {
  const dir = getSessionsDir(agentId);
  let entries: string[];
  try {
    entries = fs.readdirSync(dir);
  } catch {
    return [];
  }
  return entries
    .sort()
    .map((id) => {
      try {
        const raw = fs.readFileSync(path.join(dir, id, 'meta.json'), 'utf-8');
        const meta = JSON.parse(raw) as SessionMeta;
        return {
          id,
          agentId,
          title: meta.title,
          createdAt: meta.created_at,
          updatedAt: meta.updated_at,
        };
      } catch {
        return null;
      }
    })
    .filter((s) => s !== null);
}
```

**Step 4: Add deleteSession**

```typescript
export function deleteSession(agentId: string, sessionId: string): void {
  const dir = getSessionDir(agentId, sessionId);
  fs.rmSync(dir, { recursive: true, force: true });
}
```

**Step 5: Add appendMessage**

```typescript
interface MessageRecord {
  id: string;
  role: string;
  content: string;
  created_at: string;
}

export function appendMessage(
  agentId: string,
  sessionId: string,
  role: string,
  content: string,
): { id: string; sessionId: string; role: string; content: string; createdAt: string } {
  const id = uuidv7();
  const now = new Date().toISOString();
  const dir = getSessionDir(agentId, sessionId);
  const record: MessageRecord = { id, role, content, created_at: now };
  fs.appendFileSync(path.join(dir, 'messages.jsonl'), JSON.stringify(record) + '\n');
  // Update session's updated_at
  const metaPath = path.join(dir, 'meta.json');
  try {
    const meta = JSON.parse(fs.readFileSync(metaPath, 'utf-8')) as SessionMeta;
    meta.updated_at = now;
    fs.writeFileSync(metaPath, JSON.stringify(meta));
  } catch {
    /* ignore */
  }
  return { id, sessionId, role, content, createdAt: now };
}
```

**Step 6: Add listMessages**

```typescript
export function listMessages(
  agentId: string,
  sessionId: string,
): { id: string; sessionId: string; role: string; content: string; createdAt: string }[] {
  const filePath = path.join(getSessionDir(agentId, sessionId), 'messages.jsonl');
  let raw: string;
  try {
    raw = fs.readFileSync(filePath, 'utf-8');
  } catch {
    return [];
  }
  return raw
    .split('\n')
    .filter((line) => line.trim())
    .map((line) => {
      const r = JSON.parse(line) as MessageRecord;
      return { id: r.id, sessionId, role: r.role, content: r.content, createdAt: r.created_at };
    });
}
```

**Step 7: Verify types compile**

Run: `pnpm --filter @arfak/server tsc:check`
Expected: PASS

**Step 8: Commit**

```bash
git add server/src/lib/profile.ts
git commit -m "feat(server): add session and message filesystem operations"
```

---

### Task 4: Implement Session RPC Handlers

**Files:**

- Create: `server/src/services/session.ts`
- Modify: `server/src/routes.ts`

**Step 1: Create session service handlers**

Create `server/src/services/session.ts`:

```typescript
import {
  appendMessage,
  createSession,
  deleteSession,
  listMessages,
  listSessions,
} from '../lib/profile.js';

export const sessionHandlers = {
  async createSession(req: { agentId: string }) {
    const session = createSession(req.agentId);
    return {
      session: {
        id: session.id,
        agentId: session.agentId,
        title: session.title,
        createdAt: session.createdAt,
        updatedAt: session.updatedAt,
      },
    };
  },

  async listSessions(req: { agentId: string }) {
    const sessions = listSessions(req.agentId);
    return {
      sessions: sessions.map((s) => ({
        id: s.id,
        agentId: s.agentId,
        title: s.title,
        createdAt: s.createdAt,
        updatedAt: s.updatedAt,
      })),
    };
  },

  async deleteSession(req: { agentId: string; sessionId: string }) {
    deleteSession(req.agentId, req.sessionId);
    return {};
  },

  async sendMessage(req: { agentId: string; sessionId: string; role: string; content: string }) {
    const msg = appendMessage(req.agentId, req.sessionId, req.role, req.content);
    return {
      message: {
        id: msg.id,
        sessionId: msg.sessionId,
        role: msg.role,
        content: msg.content,
        createdAt: msg.createdAt,
      },
    };
  },

  async listMessages(req: { agentId: string; sessionId: string }) {
    const messages = listMessages(req.agentId, req.sessionId);
    return {
      messages: messages.map((m) => ({
        id: m.id,
        sessionId: m.sessionId,
        role: m.role,
        content: m.content,
        createdAt: m.createdAt,
      })),
    };
  },
};
```

**Step 2: Register handlers in routes.ts**

Update `server/src/routes.ts`:

```typescript
import type { ConnectRouter } from '@connectrpc/connect';
import { ArfakService } from './gen/arfak/v1/service_connect.js';
import { configHandlers } from './services/config.js';
import { handlers } from './services/health.js';
import { sessionHandlers } from './services/session.js';

export default (router: ConnectRouter) => {
  router.service(ArfakService, { ...handlers, ...configHandlers, ...sessionHandlers });
};
```

**Step 3: Verify types compile**

Run: `pnpm --filter @arfak/server tsc:check`
Expected: PASS

**Step 4: Commit**

```bash
git add server/src/services/session.ts server/src/routes.ts
git commit -m "feat(server): add session CRUD and message RPC handlers"
```

---

### Task 5: Create useSessions Hook

**Files:**

- Create: `ui/src/hooks/use-sessions.ts`

**Step 1: Create the hook**

Create `ui/src/hooks/use-sessions.ts` following the same `useSyncExternalStore` pattern as `use-agents.ts`:

```typescript
import type { Session } from '@gen/arfak/v1/service_pb.js';
import { createPromiseClient } from '@connectrpc/connect';
import { ArfakService } from '@gen/arfak/v1/service_connect.js';
import { useEffect, useSyncExternalStore } from 'react';
import { transport } from '@/lib/connect.js';

const client = createPromiseClient(ArfakService, transport);

interface SessionsState {
  sessions: Session[];
  selectedId: string | undefined;
  agentId: string | undefined;
}

let state: SessionsState = { sessions: [], selectedId: undefined, agentId: undefined };

const listeners = new Set<() => void>();

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function getSnapshot() {
  return state;
}

function notify() {
  for (const l of listeners) l();
}

async function fetchSessions(agentId: string) {
  try {
    const res = await client.listSessions({ agentId });
    if (state.agentId !== agentId) return; // stale
    const sessions = res.sessions;
    if (sessions.length === 0) {
      const created = await client.createSession({ agentId });
      if (state.agentId !== agentId) return;
      state = {
        sessions: created.session ? [created.session] : [],
        selectedId: created.session?.id,
        agentId,
      };
    } else {
      state = { sessions, selectedId: sessions[sessions.length - 1]?.id, agentId };
    }
    notify();
  } catch (err) {
    console.warn('[ListSessions] Failed:', err);
  }
}

function selectSession(id: string) {
  if (state.sessions.some((s) => s.id === id)) {
    state = { ...state, selectedId: id };
    notify();
  }
}

async function createSession(agentId: string) {
  try {
    const res = await client.createSession({ agentId });
    if (!res.session) return;
    state = {
      sessions: [...state.sessions, res.session],
      selectedId: res.session.id,
      agentId,
    };
    notify();
  } catch (err) {
    console.warn('[CreateSession] Failed:', err);
  }
}

async function removeSession(agentId: string, sessionId: string) {
  try {
    await client.deleteSession({ agentId, sessionId });
    const remaining = state.sessions.filter((s) => s.id !== sessionId);
    state = {
      sessions: remaining,
      selectedId:
        state.selectedId === sessionId ? remaining[remaining.length - 1]?.id : state.selectedId,
      agentId,
    };
    notify();
  } catch (err) {
    console.warn('[DeleteSession] Failed:', err);
  }
}

export function useSessions(agentId: string | undefined) {
  const snap = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);

  useEffect(() => {
    if (!agentId) return;
    if (snap.agentId !== agentId) {
      state = { sessions: [], selectedId: undefined, agentId };
      notify();
      fetchSessions(agentId);
    }
  }, [agentId]);

  const selectedSession = snap.sessions.find((s) => s.id === snap.selectedId);

  return {
    sessions: snap.sessions,
    selectedSession,
    selectSession,
    createSession: () => agentId && createSession(agentId),
    removeSession: (sessionId: string) => agentId && removeSession(agentId, sessionId),
  } as const;
}
```

**Step 2: Verify types compile**

Run: `pnpm --filter @arfak/ui tsc:check`
Expected: PASS

**Step 3: Commit**

```bash
git add ui/src/hooks/use-sessions.ts
git commit -m "feat(ui): add useSessions hook for session state management"
```

---

### Task 6: Create useMessages Hook

**Files:**

- Create: `ui/src/hooks/use-messages.ts`

**Step 1: Create the hook**

Create `ui/src/hooks/use-messages.ts`:

```typescript
import type { ChatMessage } from '@gen/arfak/v1/service_pb.js';
import { createPromiseClient } from '@connectrpc/connect';
import { ArfakService } from '@gen/arfak/v1/service_connect.js';
import { useEffect, useSyncExternalStore } from 'react';
import { transport } from '@/lib/connect.js';

const client = createPromiseClient(ArfakService, transport);

interface MessagesState {
  messages: ChatMessage[];
  sessionId: string | undefined;
}

let state: MessagesState = { messages: [], sessionId: undefined };

const listeners = new Set<() => void>();

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function getSnapshot() {
  return state;
}

function notify() {
  for (const l of listeners) l();
}

async function fetchMessages(agentId: string, sessionId: string) {
  try {
    const res = await client.listMessages({ agentId, sessionId });
    if (state.sessionId !== sessionId) return;
    state = { messages: res.messages, sessionId };
    notify();
  } catch (err) {
    console.warn('[ListMessages] Failed:', err);
  }
}

export async function sendMessage(agentId: string, sessionId: string, content: string) {
  try {
    const res = await client.sendMessage({ agentId, sessionId, role: 'user', content });
    if (!res.message || state.sessionId !== sessionId) return;
    state = { messages: [...state.messages, res.message], sessionId };
    notify();
  } catch (err) {
    console.warn('[SendMessage] Failed:', err);
  }
}

export function useMessages(agentId: string | undefined, sessionId: string | undefined) {
  const snap = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);

  useEffect(() => {
    if (!agentId || !sessionId) return;
    if (snap.sessionId !== sessionId) {
      state = { messages: [], sessionId };
      notify();
      fetchMessages(agentId, sessionId);
    }
  }, [agentId, sessionId]);

  return { messages: snap.messages } as const;
}
```

**Step 2: Verify types compile**

Run: `pnpm --filter @arfak/ui tsc:check`
Expected: PASS

**Step 3: Commit**

```bash
git add ui/src/hooks/use-messages.ts
git commit -m "feat(ui): add useMessages hook for message state management"
```

---

### Task 7: Update ChatPage with Session Tabs and Messages

**Files:**

- Modify: `ui/src/chat/ChatPage.tsx`

**Step 1: Rewrite ChatPage with tabs and message display**

Replace `ui/src/chat/ChatPage.tsx` with:

```tsx
import { ArrowUpIcon, PlusIcon, XIcon } from 'lucide-react';
import { FormEvent, useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button.js';
import { Tabs, TabsList, TabsPanel, TabsTab } from '@/components/ui/tabs.js';
import { Textarea } from '@/components/ui/textarea.js';
import { useAgents } from '@/hooks/use-agents.js';
import { sendMessage, useMessages } from '@/hooks/use-messages.js';
import { useSessions } from '@/hooks/use-sessions.js';

export default function ChatPage() {
  const [input, setInput] = useState('');
  const { selectedAgent } = useAgents();
  const { sessions, selectedSession, selectSession, createSession, removeSession } = useSessions(
    selectedAgent?.id,
  );
  const { messages } = useMessages(selectedAgent?.id, selectedSession?.id);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length]);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!input.trim() || !selectedAgent || !selectedSession) return;
    const content = input;
    setInput('');
    await sendMessage(selectedAgent.id, selectedSession.id, content);
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleSubmit(event);
    }
  };

  if (!selectedAgent) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <p className="text-sm text-muted-foreground">Select an agent to start chatting</p>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col">
      <div className="flex h-12 shrink-0 items-center border-b px-4">
        <span className="text-sm font-semibold">{selectedAgent.name}</span>
      </div>
      <Tabs
        className="flex flex-1 flex-col"
        onValueChange={(val) => selectSession(val as string)}
        value={selectedSession?.id}
      >
        <div className="flex shrink-0 items-center border-b px-2">
          <TabsList className="flex-1" variant="underline">
            {sessions.map((s) => (
              <TabsTab key={s.id} value={s.id}>
                <span className="truncate">{s.title || 'New session'}</span>
                <button
                  className="ml-1 rounded-sm p-0.5 opacity-0 hover:bg-muted group-hover:opacity-100 data-active:opacity-100"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeSession(s.id);
                  }}
                  type="button"
                >
                  <XIcon className="size-3" />
                </button>
              </TabsTab>
            ))}
          </TabsList>
          <Button
            className="ml-1 size-7 shrink-0"
            onClick={createSession}
            size="icon"
            variant="ghost"
          >
            <PlusIcon className="size-3.5" />
          </Button>
        </div>
        {sessions.map((s) => (
          <TabsPanel className="flex flex-1 flex-col" key={s.id} value={s.id}>
            <div className="flex-1 overflow-y-auto p-4">
              <div className="mx-auto flex max-w-2xl flex-col gap-3">
                {messages.length === 0 ? (
                  <p className="text-center text-sm text-muted-foreground">Start a conversation</p>
                ) : (
                  messages.map((msg) => (
                    <div
                      className={
                        msg.role === 'user'
                          ? 'ml-auto max-w-[80%] rounded-2xl bg-primary px-3 py-2 text-sm text-primary-foreground'
                          : 'mr-auto max-w-[80%] rounded-2xl bg-muted px-3 py-2 text-sm'
                      }
                      key={msg.id}
                    >
                      {msg.content}
                    </div>
                  ))
                )}
                <div ref={bottomRef} />
              </div>
            </div>
          </TabsPanel>
        ))}
      </Tabs>
      <div className="p-4">
        <form className="flex items-center gap-2" onSubmit={handleSubmit}>
          <Textarea
            className="flex-1 [&_textarea]:max-h-40 [&_textarea]:!min-h-0 [&_textarea]:resize-none [&_textarea]:py-2"
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Message..."
            rows={1}
            value={input}
          />
          <Button
            className="size-10 shrink-0 rounded-full"
            disabled={!input.trim()}
            size="icon"
            type="submit"
          >
            <ArrowUpIcon className="size-4" />
          </Button>
        </form>
      </div>
    </div>
  );
}
```

**Step 2: Verify types compile**

Run: `pnpm --filter @arfak/ui tsc:check`
Expected: PASS

**Step 3: Verify lint passes**

Run: `pnpm --filter @arfak/ui lint`
Expected: PASS

**Step 4: Format**

Run: `pnpm --filter @arfak/ui format`

**Step 5: Commit**

```bash
git add ui/src/chat/ChatPage.tsx
git commit -m "feat(ui): add session tabs and message display to ChatPage"
```

---

### Task 8: Manual Smoke Test

**Step 1: Start dev server**

Run: `pnpm dev` (in a terminal)

**Step 2: Verify in browser**

Open `http://localhost:3000` and check:

1. Select an agent in sidebar -- tab bar appears with one auto-created session
2. Click "+" to create a second session tab
3. Type a message and send -- message appears as a user bubble
4. Switch tabs -- each tab has its own message history
5. Click X on a tab -- session is removed
6. Refresh the page -- sessions and messages persist

**Step 3: Final commit if any fixes needed**

```bash
git add -A
git commit -m "fix: address smoke test findings"
```
