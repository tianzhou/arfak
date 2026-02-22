import type { Session } from '@gen/arfak/v1/service_pb.js';
import { createPromiseClient } from '@connectrpc/connect';
import { ArfakService } from '@gen/arfak/v1/service_connect.js';
import { useEffect, useSyncExternalStore } from 'react';
import { transport } from '@/lib/connect.js';

const client = createPromiseClient(ArfakService, transport);

const STORAGE_KEY = 'arfak-agents';

function loadAgentSetting(agentId: string, key: string): string | undefined {
  try {
    const data = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '{}') as Record<
      string,
      Record<string, string>
    >;
    return data[agentId]?.[key];
  } catch {
    return undefined;
  }
}

function saveAgentSetting(agentId: string, key: string, value: string) {
  try {
    const data = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '{}') as Record<
      string,
      Record<string, string>
    >;
    data[agentId] = { ...data[agentId], [key]: value };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    // localStorage unavailable
  }
}

interface SessionsState {
  agentId: string | undefined;
  sessions: Array<Session>;
}

let state: SessionsState = { agentId: undefined, sessions: [] };

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
    state = { agentId, sessions: res.sessions };
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
    state = {
      agentId,
      sessions: [...state.sessions, res.session],
    };
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
    const remaining = state.sessions.filter((s) => s.id !== sessionId);
    state = { agentId, sessions: remaining };
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
  state = {
    agentId,
    sessions: state.sessions.filter((s) => s.id === keepSessionId),
  };
  notify();
}

async function removeAllSessions(agentId: string) {
  await deleteSessions(agentId, state.sessions);
  state = { agentId, sessions: [] };
  notify();
}

async function removeSessionsToRight(agentId: string, sessionId: string) {
  const idx = state.sessions.findIndex((s) => s.id === sessionId);
  if (idx === -1) {
    return;
  }
  await deleteSessions(agentId, state.sessions.slice(idx + 1));
  const remaining = state.sessions.slice(0, idx + 1);
  state = { agentId, sessions: remaining };
  notify();
}

export function getDefaultSessionId(agentId: string, sessions: Array<Session>): string | undefined {
  const saved = loadAgentSetting(agentId, 'selectedSessionId');
  return sessions.some((s) => s.id === saved) ? saved : sessions.at(-1)?.id;
}

export function saveSelectedSession(agentId: string, sessionId: string) {
  saveAgentSetting(agentId, 'selectedSessionId', sessionId);
}

export function useSessions(agentId: string | undefined) {
  const snap = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);

  useEffect(() => {
    if (!agentId) {
      return;
    }
    if (snap.agentId !== agentId) {
      state = { agentId, sessions: [] };
      notify();
      fetchSessions(agentId);
    }
  }, [agentId, snap.agentId]);

  return {
    createSession: (): Promise<string | undefined> =>
      agentId ? createSession(agentId) : Promise.resolve(undefined),
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
    sessions: snap.sessions,
  } as const;
}
