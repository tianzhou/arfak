import { ArrowUpIcon } from 'lucide-react';
import { FormEvent, useState } from 'react';
import { Button } from '@/components/ui/button.js';
import { Textarea } from '@/components/ui/textarea.js';
import { useAgents } from '@/hooks/use-agents.js';

export default function ChatPage() {
  const [input, setInput] = useState('');
  const { selectedAgent } = useAgents();

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (!input.trim() || !selectedAgent) return;
    setInput('');
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
      <div className="flex h-12 shrink-0 items-center border-b px-4">
        <span className="text-sm font-semibold">{selectedAgent.name}</span>
      </div>
      <div className="flex-1 overflow-y-auto p-4">
        <div className="mx-auto max-w-2xl">
          <p className="text-center text-sm text-muted-foreground">Start a conversation</p>
        </div>
      </div>
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
