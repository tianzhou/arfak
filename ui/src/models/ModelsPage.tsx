import type { Model } from '@gen/arfak/v1/service_pb.js';
import { createPromiseClient } from '@connectrpc/connect';
import { ArfakService } from '@gen/arfak/v1/service_connect.js';
import { useEffect, useState } from 'react';
import { transport } from '@/lib/connect.js';

const client = createPromiseClient(ArfakService, transport);

export default function ModelsPage() {
  const [models, setModels] = useState<Model[]>([]);

  useEffect(() => {
    client
      .listModels({})
      .then((res) => setModels(res.models))
      .catch((err: unknown) => console.warn('[ListModels] Failed:', err));
  }, []);

  return (
    <div className="flex flex-1 flex-col overflow-y-auto p-6">
      <div className="mx-auto w-full max-w-3xl">
        <h1 className="mb-6 text-lg font-semibold">Models</h1>
        {models.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No models configured. Add <code>[[models]]</code> entries to your{' '}
            <code>arfak.toml</code>.
          </p>
        ) : (
          <div className="divide-y rounded-md border">
            {models.map((m) => (
              <div className="flex items-center gap-4 px-4 py-3" key={m.id}>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{m.name}</p>
                  <p className="truncate text-xs text-muted-foreground">
                    {m.model} by {m.vendor}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
