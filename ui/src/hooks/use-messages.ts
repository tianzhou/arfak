import type { ChatMessage } from '@gen/arfak/v1/service_pb.js';
import { createPromiseClient } from '@connectrpc/connect';
import { ArfakService } from '@gen/arfak/v1/service_connect.js';
import { useEffect, useSyncExternalStore } from 'react';
import { transport } from '@/lib/connect.js';

const client = createPromiseClient(ArfakService, transport);

interface MessagesState {
  messages: Array<ChatMessage>;
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
  for (const l of listeners) {
    l();
  }
}

async function fetchMessages(agentId: string, sessionId: string) {
  try {
    const res = await client.listMessages({ agentId, sessionId });
    if (state.sessionId !== sessionId) {
      return;
    }
    state = { messages: res.messages, sessionId };
    notify();
  } catch (error: unknown) {
    console.warn('[ListMessages] Failed:', error);
  }
}

export async function sendMessage(agentId: string, sessionId: string, content: string) {
  try {
    const res = await client.sendMessage({ agentId, content, role: 'user', sessionId });
    if (!res.message || state.sessionId !== sessionId) {
      return;
    }
    state = { messages: [...state.messages, res.message], sessionId };
    notify();
  } catch (error: unknown) {
    console.warn('[SendMessage] Failed:', error);
  }
}

export function useMessages(agentId: string | undefined, sessionId: string | undefined) {
  const snap = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);

  useEffect(() => {
    if (!agentId || !sessionId) {
      return;
    }
    if (snap.sessionId !== sessionId) {
      state = { messages: [], sessionId };
      notify();
      fetchMessages(agentId, sessionId);
    }
  }, [agentId, sessionId, snap.sessionId]);

  return { messages: snap.messages } as const;
}
