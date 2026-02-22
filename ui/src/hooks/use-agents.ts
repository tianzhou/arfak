import type { Agent } from '@gen/arfak/v1/service_pb.js';
import { createPromiseClient } from '@connectrpc/connect';
import { ArfakService } from '@gen/arfak/v1/service_connect.js';
import { useSyncExternalStore } from 'react';
import { transport } from '@/lib/connect.js';

const client = createPromiseClient(ArfakService, transport);

interface AgentsState {
  agents: Agent[];
  selectedId: string | undefined;
}

let state: AgentsState = { agents: [], selectedId: undefined };
let fetched = false;

const listeners = new Set<() => void>();

function subscribe(listener: () => void) {
  listeners.add(listener);

  if (!fetched) {
    fetched = true;
    client
      .listAgents({})
      .then((res) => {
        state = {
          agents: res.agents,
          selectedId: res.agents[0]?.id,
        };
        notify();
      })
      .catch((err: unknown) => console.warn('[ListAgents] Failed:', err));
  }

  return () => listeners.delete(listener);
}

function getSnapshot() {
  return state;
}

function notify() {
  for (const l of listeners) l();
}

function selectAgent(id: string) {
  if (state.agents.some((a) => a.id === id)) {
    state = { ...state, selectedId: id };
    notify();
  }
}

export function useAgents() {
  const { agents, selectedId } = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
  const selectedAgent = agents.find((a) => a.id === selectedId);
  return { agents, selectedAgent, selectAgent } as const;
}
