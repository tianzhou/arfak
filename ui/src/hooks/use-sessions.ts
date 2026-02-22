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
