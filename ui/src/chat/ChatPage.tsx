import { SendIcon } from 'lucide-react';
import { FormEvent, useState } from 'react';
import { Button } from '@/components/ui/button.js';
import { Textarea } from '@/components/ui/textarea.js';

export default function ChatPage() {
  const [input, setInput] = useState('');

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
        <form className="mx-auto flex max-w-2xl items-end gap-2" onSubmit={handleSubmit}>
          <Textarea
            className="min-h-[40px] flex-1 resize-none"
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a message..."
            rows={1}
            value={input}
          />
          <Button disabled={!input.trim()} size="icon" type="submit">
            <SendIcon className="size-4" />
          </Button>
        </form>
      </div>
    </div>
  );
}
