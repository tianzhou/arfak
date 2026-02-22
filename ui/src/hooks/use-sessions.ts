import type { Session } from '@gen/arfak/v1/service_pb.js';
import { createPromiseClient } from '@connectrpc/connect';
import { ArfakService } from '@gen/arfak/v1/service_connect.js';
import { useEffect, useSyncExternalStore } from 'react';
import { transport } from '@/lib/connect.js';

const client = createPromiseClient(ArfakService, transport);

interface SessionsState {
  agentId: string | undefined;
  loaded: boolean;
  sessions: Array<Session>;
}

let state: SessionsState = { agentId: undefined, loaded: false, sessions: [] };

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
    state = { agentId, loaded: true, sessions: res.sessions };
    notify();
  } catch (error: unknown) {
    console.warn('[ListSessions] Failed:', error);
  }
}

async function createSession(agentId: string): Promise<string | undefined> {
  try {
    const res = await client.createSession({ agentId });
    if (!res.session) {
      return undefined;
    }
    state = { ...state, sessions: [...state.sessions, res.session] };
    notify();
    return res.session.id;
  } catch (error: unknown) {
    console.warn('[CreateSession] Failed:', error);
    return undefined;
  }
}

async function removeSession(agentId: string, sessionId: string) {
  try {
    await client.deleteSession({ agentId, sessionId });
    state = { ...state, sessions: state.sessions.filter((s) => s.id !== sessionId) };
    notify();
  } catch (error: unknown) {
    console.warn('[DeleteSession] Failed:', error);
  }
}

async function deleteSessions(agentId: string, sessions: Array<Session>) {
  for (const s of sessions) {
    try {
      await client.deleteSession({ agentId, sessionId: s.id });
    } catch (error: unknown) {
      console.warn('[DeleteSession] Failed:', error);
    }
  }
}

function reorderSessions(fromIndex: number, toIndex: number) {
  const sessions = [...state.sessions];
  const [moved] = sessions.splice(fromIndex, 1);
  sessions.splice(toIndex, 0, moved);
  state = { ...state, sessions };
  notify();
}

async function removeOtherSessions(agentId: string, keepSessionId: string) {
  await deleteSessions(
    agentId,
    state.sessions.filter((s) => s.id !== keepSessionId),
  );
  state = { ...state, sessions: state.sessions.filter((s) => s.id === keepSessionId) };
  notify();
}

async function removeAllSessions(agentId: string) {
  await deleteSessions(agentId, state.sessions);
  state = { ...state, sessions: [] };
  notify();
}

async function removeSessionsToRight(agentId: string, sessionId: string) {
  const idx = state.sessions.findIndex((s) => s.id === sessionId);
  if (idx === -1) {
    return;
  }
  await deleteSessions(agentId, state.sessions.slice(idx + 1));
  state = { ...state, sessions: state.sessions.slice(0, idx + 1) };
  notify();
}

export function useSessions(agentId: string | undefined) {
  const snap = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);

  useEffect(() => {
    if (!agentId) {
      return;
    }
    if (snap.agentId !== agentId) {
      state = { agentId, loaded: false, sessions: [] };
      notify();
      fetchSessions(agentId);
    }
  }, [agentId, snap.agentId]);

  const current = snap.agentId === agentId;

  return {
    createSession: (): Promise<string | undefined> =>
      agentId ? createSession(agentId) : Promise.resolve(undefined),
    loaded: current && snap.loaded,
    removeAllSessions: () => {
      if (agentId) removeAllSessions(agentId);
    },
    removeOtherSessions: (keepSessionId: string) => {
      if (agentId) removeOtherSessions(agentId, keepSessionId);
    },
    removeSession: (sessionId: string) => {
      if (agentId) removeSession(agentId, sessionId);
    },
    removeSessionsToRight: (sessionId: string) => {
      if (agentId) removeSessionsToRight(agentId, sessionId);
    },
    reorderSessions,
    sessions: current ? snap.sessions : [],
  } as const;
}
