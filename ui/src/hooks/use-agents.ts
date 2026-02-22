import type { Agent } from '@gen/arfak/v1/service_pb.js';
import { createPromiseClient } from '@connectrpc/connect';
import { ArfakService } from '@gen/arfak/v1/service_connect.js';
import { useSyncExternalStore } from 'react';
import { transport } from '@/lib/connect.js';

const client = createPromiseClient(ArfakService, transport);

let agents: Array<Agent> = [];
let fetched = false;

const listeners = new Set<() => void>();

function subscribe(listener: () => void) {
  listeners.add(listener);

  if (!fetched) {
    fetched = true;
    client
      .listAgents({})
      .then((res) => {
        agents = res.agents;
        for (const l of listeners) l();
      })
      .catch((err: unknown) => console.warn('[ListAgents] Failed:', err));
  }

  return () => listeners.delete(listener);
}

function getSnapshot() {
  return agents;
}

export function useAgents() {
  const agents = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
  return { agents } as const;
}
