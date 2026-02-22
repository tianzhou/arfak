import { useModels } from '@/hooks/use-models.js';

export default function ModelsPage() {
  const { models } = useModels();

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
