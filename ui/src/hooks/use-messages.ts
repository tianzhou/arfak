import type { ChatMessage } from '@gen/arfak/v1/service_pb.js';
import { createPromiseClient } from '@connectrpc/connect';
import { ArfakService } from '@gen/arfak/v1/service_connect.js';
import { useEffect, useSyncExternalStore } from 'react';
import { transport } from '@/lib/connect.js';

const client = createPromiseClient(ArfakService, transport);

interface MessagesState {
  messages: Array<ChatMessage>;
  sessionId: string | undefined;
  pending: boolean;
}

let state: MessagesState = { messages: [], sessionId: undefined, pending: false };

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
    state = { ...state, messages: res.messages, sessionId };
    notify();
  } catch (error: unknown) {
    console.warn('[ListMessages] Failed:', error);
  }
}

export async function sendMessage(agentId: string, sessionId: string, content: string) {
  if (state.pending) {
    return;
  }

  // Optimistically add user message
  const userMsg = {
    content,
    createdAt: new Date().toISOString(),
    id: `temp-${Date.now()}`,
    role: 'user',
    sessionId,
  } as unknown as ChatMessage;

  // Add streaming placeholder for assistant
  const assistantMsg = {
    content: '',
    createdAt: new Date().toISOString(),
    id: `temp-assistant-${Date.now()}`,
    role: 'assistant',
    sessionId,
  } as unknown as ChatMessage;

  state = {
    messages: [...state.messages, userMsg, assistantMsg],
    sessionId,
    pending: true,
  };
  notify();

  try {
    const stream = client.streamChat({ agentId, content, sessionId });
    let accumulatedText = '';

    for await (const response of stream) {
      if (state.sessionId !== sessionId) {
        return;
      }

      if (response.message) {
        // Final message — re-fetch to get accurate IDs for all messages
        await fetchMessages(agentId, sessionId);
        state = { ...state, pending: false };
        notify();
        return;
      }

      if (response.textDelta) {
        accumulatedText += response.textDelta;
        // Update the streaming assistant message content
        const updated = [...state.messages];
        const lastMsg = updated.at(-1);
        if (lastMsg) {
          updated[updated.length - 1] = {
            ...lastMsg,
            content: accumulatedText,
          } as unknown as ChatMessage;
        }
        state = { ...state, messages: updated };
        notify();
      }
    }
  } catch (error: unknown) {
    console.warn('[StreamChat] Failed:', error);
    // On error, re-fetch to get accurate state
    state = { ...state, pending: false };
    notify();
    await fetchMessages(agentId, sessionId);
  }
}

export function useMessages(agentId: string | undefined, sessionId: string | undefined) {
  const snap = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);

  useEffect(() => {
    if (!agentId || !sessionId) {
      return;
    }
    if (snap.sessionId !== sessionId) {
      state = { messages: [], sessionId, pending: false };
      notify();
      fetchMessages(agentId, sessionId);
    }
  }, [agentId, sessionId, snap.sessionId]);

  return { messages: snap.messages, pending: snap.pending } as const;
}
