'use client';

import { useRef } from "react";
import { useChat } from 'ai/react';

export function Chat({ handler }: { handler: any }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const { messages, input, handleInputChange, handleSubmit } = useChat({
    api: handler,
  });

  return (
    <div className="flex flex-col w-full max-w-md py-24 mx-auto stretch">
      <ul>
        {messages.map((m, index) => (
          <li key={index}>
            {m.role === 'user' ? 'User: ' : 'AI: '}
            {m.role === 'user' ? m.content : m.ui}
          </li>
        ))}
      </ul>

      <form onSubmit={handleSubmit}>
        <textarea
          className="fixed bottom-0 w-full max-w-md p-2 mb-8 border border-gray-300 rounded shadow-xl h-[130px]"
          placeholder="Ask me anything."
          value={input}
          onChange={handleInputChange}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              inputRef.current?.click();
          }}}
          autoFocus
        />
        <input type="submit" ref={inputRef} className="hidden" />
      </form>
    </div>
  );
}
