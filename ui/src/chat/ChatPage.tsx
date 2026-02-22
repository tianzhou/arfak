import { ArrowUpIcon, PlusIcon, XIcon } from 'lucide-react';
import { FormEvent, useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button.js';
import { Tabs, TabsList, TabsPanel, TabsTab } from '@/components/ui/tabs.js';
import { Textarea } from '@/components/ui/textarea.js';
import { useAgents } from '@/hooks/use-agents.js';
import { sendMessage, useMessages } from '@/hooks/use-messages.js';
import { useSessions } from '@/hooks/use-sessions.js';

export default function ChatPage() {
  const [input, setInput] = useState('');
  const { selectedAgent } = useAgents();
  const { createSession, removeSession, selectedSession, selectSession, sessions } = useSessions(
    selectedAgent?.id,
  );
  const { messages } = useMessages(selectedAgent?.id, selectedSession?.id);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length]);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!input.trim() || !selectedAgent || !selectedSession) {
      return;
    }
    const content = input;
    setInput('');
    await sendMessage(selectedAgent.id, selectedSession.id, content);
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleSubmit(event);
    }
  };

  if (!selectedAgent) {
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
        onValueChange={(val) => selectSession(val as string)}
        value={selectedSession?.id}
      >
        <div className="flex h-12 shrink-0 items-center border-b px-2">
          <span className="shrink-0 px-2 text-sm font-semibold">{selectedAgent.name}</span>
          <TabsList variant="underline">
            {sessions.map((s) => (
              <TabsTab key={s.id} value={s.id}>
                <span className="truncate">{s.title || 'New session'}</span>
                <button
                  className="ml-1 rounded-sm p-0.5 opacity-0 group-hover:opacity-100 hover:bg-muted data-active:opacity-100"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeSession(s.id);
                  }}
                  type="button"
                >
                  <XIcon className="size-3" />
                </button>
              </TabsTab>
            ))}
          </TabsList>
          <Button
            className="ml-1 size-7 shrink-0"
            onClick={createSession}
            size="icon"
            variant="ghost"
          >
            <PlusIcon className="size-3.5" />
          </Button>
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
                      {msg.content}
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
            value={input}
          />
          <Button
            className="size-10 shrink-0 rounded-full"
            disabled={!input.trim()}
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
