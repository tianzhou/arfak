import { ContextMenu } from '@base-ui/react/context-menu';
import { ArrowUpIcon, PlusIcon, XIcon } from 'lucide-react';
import { FormEvent, useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import { Button } from '@/components/ui/button.js';
import { MenuItem, MenuSeparator } from '@/components/ui/menu.js';
import { Tabs, TabsList, TabsPanel, TabsTab } from '@/components/ui/tabs.js';
import { Textarea } from '@/components/ui/textarea.js';
import { useAgents } from '@/hooks/use-agents.js';
import { sendMessage, useMessages } from '@/hooks/use-messages.js';
import { useModels } from '@/hooks/use-models.js';
import { useSessions } from '@/hooks/use-sessions.js';
import { getLastSessionId, saveLastSessionId } from '@/lib/utils.js';

export default function ChatPage() {
  const [input, setInput] = useState('');
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const { agentId, sessionId } = useParams();
  const navigate = useNavigate();
  const {
    createSession,
    loaded,
    removeAllSessions,
    removeOtherSessions,
    removeSession,
    removeSessionsToRight,
    reorderSessions,
    sessions,
  } = useSessions(agentId);

  const { agents } = useAgents();
  const { models } = useModels();
  const { messages, pending } = useMessages(agentId, sessionId);
  const bottomRef = useRef<HTMLDivElement>(null);

  const agent = agents.find((a) => a.id === agentId);
  const model = models.find((m) => m.id === agent?.model);

  // Persist last selected session per agent
  useEffect(() => {
    if (agentId && sessionId && sessions.some((s) => s.id === sessionId)) {
      saveLastSessionId(agentId, sessionId);
    }
  }, [agentId, sessionId, sessions]);

  // Sync URL with available sessions (only after sessions are loaded)
  useEffect(() => {
    if (!agentId || !loaded) {
      return;
    }
    if (sessions.length === 0) {
      if (sessionId) {
        navigate(`/agents/${agentId}`, { replace: true });
      }
      return;
    }
    if (!sessionId || !sessions.some((s) => s.id === sessionId)) {
      const savedId = getLastSessionId(agentId);
      const target = sessions.find((s) => s.id === savedId) ?? sessions.at(-1);
      if (target) {
        navigate(`/agents/${agentId}/sessions/${target.id}`, { replace: true });
      }
    }
  }, [sessionId, sessions, loaded, agentId, navigate]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length]);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!input.trim() || !agentId || pending) {
      return;
    }
    const content = input;
    setInput('');
    let targetSessionId = sessionId;
    if (!targetSessionId) {
      targetSessionId = await createSession();
      if (targetSessionId) {
        navigate(`/agents/${agentId}/sessions/${targetSessionId}`);
      }
    }
    if (targetSessionId) {
      await sendMessage(agentId, targetSessionId, content);
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleSubmit(event);
    }
  };

  const handleCreate = async () => {
    const newId = await createSession();
    if (newId && agentId) {
      navigate(`/agents/${agentId}/sessions/${newId}`);
    }
  };

  if (!agentId) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <p className="text-sm text-muted-foreground">Select an agent to start chatting</p>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col">
      <Tabs
        className="flex flex-1 flex-col"
        onValueChange={(val) => navigate(`/agents/${agentId}/sessions/${val}`)}
        value={sessionId}
      >
        <div className="flex h-12 min-w-0 shrink-0 items-center border-b px-2">
          <Button
            className="mr-1 size-7 shrink-0"
            onClick={handleCreate}
            size="icon"
            variant="ghost"
          >
            <PlusIcon className="size-3.5" />
          </Button>
          <TabsList className="gap-x-0 overflow-x-auto [scrollbar-width:none]" variant="underline">
            {sessions.map((s, i) => (
              <ContextMenu.Root key={s.id}>
                <ContextMenu.Trigger className="contents">
                  <TabsTab
                    className="group grow-0 px-2"
                    draggable
                    onDragEnd={() => setDragOverIndex(null)}
                    onDragOver={(e) => {
                      e.preventDefault();
                      setDragOverIndex(i);
                    }}
                    onDragStart={(e) => {
                      e.dataTransfer.effectAllowed = 'move';
                      e.dataTransfer.setData('text/plain', String(i));
                    }}
                    onDrop={(e) => {
                      e.preventDefault();
                      const fromIndex = Number(e.dataTransfer.getData('text/plain'));
                      if (fromIndex !== i) {
                        reorderSessions(fromIndex, i);
                      }
                      setDragOverIndex(null);
                    }}
                    onMouseDown={(e) => {
                      if (e.button === 1) {
                        e.preventDefault();
                        removeSession(s.id);
                      }
                    }}
                    value={s.id}
                  >
                    {dragOverIndex === i && (
                      <div className="absolute inset-y-1 left-0 w-0.5 rounded-full bg-primary" />
                    )}
                    <span className="truncate">{s.title}</span>
                    <button
                      className="absolute -top-1 -right-0.5 rounded-full bg-muted px-1 py-0.5 opacity-0 group-hover:opacity-100 hover:bg-accent"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeSession(s.id);
                      }}
                      type="button"
                    >
                      <XIcon className="size-2.5" />
                    </button>
                  </TabsTab>
                </ContextMenu.Trigger>
                <ContextMenu.Portal>
                  <ContextMenu.Positioner className="z-50" sideOffset={4}>
                    <ContextMenu.Popup className="min-w-40 rounded-lg border bg-popover p-1 shadow-lg/5">
                      <MenuItem onClick={() => removeSession(s.id)}>Close</MenuItem>
                      <MenuItem onClick={() => removeOtherSessions(s.id)}>Close Others</MenuItem>
                      <MenuItem onClick={() => removeAllSessions()}>Close All</MenuItem>
                      <MenuSeparator />
                      <MenuItem onClick={() => removeSessionsToRight(s.id)}>
                        Close Tabs to the Right
                      </MenuItem>
                    </ContextMenu.Popup>
                  </ContextMenu.Positioner>
                </ContextMenu.Portal>
              </ContextMenu.Root>
            ))}
          </TabsList>
        </div>
        {sessions.map((s) => (
          <TabsPanel className="flex flex-1 flex-col" key={s.id} value={s.id}>
            <div className="flex-1 overflow-y-auto p-4">
              <div className="mx-auto flex max-w-2xl flex-col gap-3">
                {messages.length === 0 ? (
                  <p className="text-center text-sm text-muted-foreground">Start a conversation</p>
                ) : (
                  messages.map((msg) => (
                    <div
                      className={
                        msg.role === 'user'
                          ? 'ml-auto max-w-[80%] rounded-2xl bg-primary px-3 py-2 text-sm text-primary-foreground'
                          : 'mr-auto max-w-[80%] rounded-2xl bg-muted px-3 py-2 text-sm'
                      }
                      key={msg.id}
                    >
                      {msg.content ||
                        (msg.role === 'assistant' && (
                          <span className="inline-flex gap-1">
                            <span className="size-1.5 animate-pulse rounded-full bg-current" />
                            <span className="size-1.5 animate-pulse rounded-full bg-current [animation-delay:150ms]" />
                            <span className="size-1.5 animate-pulse rounded-full bg-current [animation-delay:300ms]" />
                          </span>
                        ))}
                    </div>
                  ))
                )}
                <div ref={bottomRef} />
              </div>
            </div>
          </TabsPanel>
        ))}
      </Tabs>
      <div className="p-4">
        <form className="flex items-center gap-2" onSubmit={handleSubmit}>
          <Textarea
            className="flex-1 [&_textarea]:max-h-40 [&_textarea]:!min-h-0 [&_textarea]:resize-none [&_textarea]:py-2"
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Message..."
            rows={1}
            startAddon={
              model && (
                <span className="ml-2 inline-flex shrink-0 items-center rounded-md bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                  {model.name}
                </span>
              )
            }
            value={input}
          />
          <Button
            className="size-10 shrink-0 rounded-full"
            disabled={!input.trim() || pending}
            size="icon"
            type="submit"
          >
            <ArrowUpIcon className="size-4" />
          </Button>
        </form>
      </div>
    </div>
  );
}
