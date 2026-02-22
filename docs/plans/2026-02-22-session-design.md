# Session Design

Sessions model conversations with agents. Each session belongs to one agent; an agent can have multiple concurrent sessions. The UI presents sessions as tabs within each agent's chat view.

## Data Model

### Protobuf Messages

```protobuf
message Session {
  string id = 1;           // UUIDv7
  string agent_id = 2;
  string title = 3;
  string created_at = 4;   // ISO 8601
  string updated_at = 5;   // ISO 8601
}

message Message {
  string id = 1;           // UUIDv7
  string session_id = 2;
  string role = 3;         // "user" | "assistant"
  string content = 4;
  string created_at = 5;   // ISO 8601
}
```

### RPCs

```protobuf
rpc CreateSession(CreateSessionRequest) returns (CreateSessionResponse);
rpc ListSessions(ListSessionsRequest) returns (ListSessionsResponse);
rpc DeleteSession(DeleteSessionRequest) returns (DeleteSessionResponse);
rpc SendMessage(SendMessageRequest) returns (SendMessageResponse);
rpc ListMessages(ListMessagesRequest) returns (ListMessagesResponse);
```

### Filesystem Layout

```
state/agents/{agent-id}/sessions/
  {session-uuid-v7}/
    meta.json         # { title, created_at, updated_at }
    messages.jsonl    # One JSON object per line: { id, role, content, created_at }
```

UUIDv7 provides time-ordered, globally unique session and message IDs.

## UI Architecture

### Tab View

```
+------------------------------------------+
| Ada                                      |  Agent header
+------------------------------------------+
| [Session 1] [Session 2] [+]             |  Tab bar
+------------------------------------------+
|                                          |
|         Message history area             |
|                                          |
+------------------------------------------+
| [Message input...              ] [Send]  |  Input
+------------------------------------------+
```

### Behavior

- Selecting an agent loads its sessions and selects the most recent.
- "+" tab creates a new session via CreateSession and selects it.
- Tab title shows the session title (defaults to "New session").
- Tab close (x button) calls DeleteSession after confirmation.
- If an agent has no sessions, one is auto-created.

### State Management

- `useSessions(agentId)` hook: fetches sessions via ListSessions, tracks selectedSessionId, re-fetches on agent change. Uses `useSyncExternalStore` pattern.
- `useMessages(sessionId)` hook: fetches messages via ListMessages, appends optimistically on SendMessage.

## Server Implementation

### Profile Library Extensions (`server/src/lib/profile.ts`)

New functions:

- `getSessionsDir(agentId)` / `getSessionDir(agentId, sessionId)`
- `createSession(agentId)` -- create dir + meta.json, return Session
- `listSessions(agentId)` -- read all session dirs, return Session[]
- `deleteSession(agentId, sessionId)` -- remove session dir
- `appendMessage(agentId, sessionId, role, content)` -- append to messages.jsonl
- `listMessages(agentId, sessionId)` -- read messages.jsonl, return Message[]

### Service Handlers (`server/src/services/session.ts`)

Five RPC handlers, each thin -- delegates to profile functions.

### Dependencies

- `uuidv7` package for UUIDv7 generation.

## Future Work

- `WatchSession` server-streaming RPC for real-time message delivery (external sources like Telegram/WhatsApp).
- Auto-title sessions from first message content.
- LLM chat completion integration (SendMessage calls LLM, streams response).
