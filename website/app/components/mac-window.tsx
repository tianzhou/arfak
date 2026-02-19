export function MacWindow({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="border-2 border-foreground shadow-[4px_4px_0_0_var(--foreground)]">
      <div className="flex items-center border-b-2 border-foreground">
        <div className="flex h-6 w-6 items-center justify-center border-r-2 border-foreground">
          <div className="h-2.5 w-2.5 border border-foreground" />
        </div>
        <div className="mac-title-bar relative flex-1 py-1.5">
          <span className="absolute inset-0 flex items-center justify-center">
            <span className="bg-background px-3 text-sm font-bold">
              {title}
            </span>
          </span>
        </div>
      </div>
      <div className="bg-background">{children}</div>
    </div>
  );
}
