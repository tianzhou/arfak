import type { Model } from '@gen/arfak/v1/service_pb.js';
import { createPromiseClient } from '@connectrpc/connect';
import { ArfakService } from '@gen/arfak/v1/service_connect.js';
import { useSyncExternalStore } from 'react';
import { transport } from '@/lib/connect.js';

const client = createPromiseClient(ArfakService, transport);

let models: Array<Model> = [];
let fetched = false;

const listeners = new Set<() => void>();

function subscribe(listener: () => void) {
  listeners.add(listener);

  if (!fetched) {
    fetched = true;
    client
      .listModels({})
      .then((res) => {
        models = res.models;
        for (const l of listeners) l();
      })
      .catch((err: unknown) => console.warn('[ListModels] Failed:', err));
  }

  return () => listeners.delete(listener);
}

function getSnapshot() {
  return models;
}

export function useModels() {
  const models = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
  return { models } as const;
}
