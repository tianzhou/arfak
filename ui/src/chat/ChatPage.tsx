import { SendIcon } from 'lucide-react';
import { FormEvent, useState } from 'react';
import { Button } from '@/components/ui/button.js';
import {
  Select,
  SelectItem,
  SelectPopup,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select.js';
import { useAgents } from '@/hooks/use-agents.js';

export default function ChatPage() {
  const [input, setInput] = useState('');
  const { agents, selectedAgent, selectAgent } = useAgents();

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (!input.trim()) return;
    setInput('');
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleSubmit(event);
    }
  };

  return (
    <div className="flex flex-1 flex-col">
      <div className="flex-1 overflow-y-auto p-4">
        <div className="mx-auto max-w-2xl">
          <p className="text-center text-sm text-muted-foreground">Start a conversation</p>
        </div>
      </div>
      <div className="border-t p-4">
        <form
          className="mx-auto flex max-w-2xl flex-col rounded-xl border bg-background shadow-xs"
          onSubmit={handleSubmit}
        >
          <textarea
            className="field-sizing-content w-full resize-none overflow-hidden bg-transparent px-3 pt-3 pb-6 text-sm outline-none placeholder:text-muted-foreground"
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={
              selectedAgent ? `Send message to ${selectedAgent.name}...` : 'Type a message...'
            }
            value={input}
          />
          <div className="flex items-center justify-between px-3 pb-2">
            {agents.length > 0 && (
              <Select
                value={selectedAgent?.id ?? null}
                onValueChange={(value) => {
                  if (value) selectAgent(value);
                }}
              >
                <SelectTrigger className="w-auto min-w-0" size="sm">
                  <SelectValue placeholder="Agent" />
                </SelectTrigger>
                <SelectPopup>
                  {agents.map((agent) => (
                    <SelectItem key={agent.id} value={agent.id}>
                      {agent.name}
                    </SelectItem>
                  ))}
                </SelectPopup>
              </Select>
            )}
            <Button disabled={!input.trim()} size="icon" type="submit">
              <SendIcon className="size-4" />
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
