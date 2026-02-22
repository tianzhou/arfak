import type { Session } from '@gen/arfak/v1/service_pb.js';
import { createPromiseClient } from '@connectrpc/connect';
import { ArfakService } from '@gen/arfak/v1/service_connect.js';
import { useEffect, useSyncExternalStore } from 'react';
import { transport } from '@/lib/connect.js';

const client = createPromiseClient(ArfakService, transport);

interface SessionsState {
  agentId: string | undefined;
  selectedId: string | undefined;
  sessions: Array<Session>;
}

let state: SessionsState = { agentId: undefined, selectedId: undefined, sessions: [] };

const listeners = new Set<() => void>();

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function getSnapshot() {
  return state;
}

function notify() {
  for (const l of listeners) {
    l();
  }
}

async function fetchSessions(agentId: string) {
  try {
    const res = await client.listSessions({ agentId });
    if (state.agentId !== agentId) {
      return;
    }
    const sessions = res.sessions;
    if (sessions.length === 0) {
      const created = await client.createSession({ agentId });
      if (state.agentId !== agentId) {
        return;
      }
      state = {
        agentId,
        selectedId: created.session?.id,
        sessions: created.session ? [created.session] : [],
      };
    } else {
      state = { agentId, selectedId: sessions.at(-1)?.id, sessions };
    }
    notify();
  } catch (error: unknown) {
    console.warn('[ListSessions] Failed:', error);
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
    if (!res.session) {
      return;
    }
    state = {
      agentId,
      selectedId: res.session.id,
      sessions: [...state.sessions, res.session],
    };
    notify();
  } catch (error: unknown) {
    console.warn('[CreateSession] Failed:', error);
  }
}

async function removeSession(agentId: string, sessionId: string) {
  try {
    await client.deleteSession({ agentId, sessionId });
    const remaining = state.sessions.filter((s) => s.id !== sessionId);
    state = {
      agentId,
      selectedId: state.selectedId === sessionId ? remaining.at(-1)?.id : state.selectedId,
      sessions: remaining,
    };
    notify();
  } catch (error: unknown) {
    console.warn('[DeleteSession] Failed:', error);
  }
}

export function useSessions(agentId: string | undefined) {
  const snap = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);

  useEffect(() => {
    if (!agentId) {
      return;
    }
    if (snap.agentId !== agentId) {
      state = { agentId, selectedId: undefined, sessions: [] };
      notify();
      fetchSessions(agentId);
    }
  }, [agentId, snap.agentId]);

  const selectedSession = snap.sessions.find((s) => s.id === snap.selectedId);

  return {
    createSession: () => agentId && createSession(agentId),
    removeSession: (sessionId: string) => agentId && removeSession(agentId, sessionId),
    selectedSession,
    selectSession,
    sessions: snap.sessions,
  } as const;
}
