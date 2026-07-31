'use client';

import { useState, useRef, useEffect } from 'react';
import { Bot, Send, User, Loader2, MessageSquare, RefreshCw, AlertCircle } from 'lucide-react';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

interface RepoChatProps {
  owner: string;
  repo: string;
  repoContext: {
    description: string | null;
    language: string | null;
    stars: number;
    forks: number;
    readme: string;
    commits: Array<{ sha: string; message: string; author: string; date: string }>;
    contents: Array<{ name: string; type: string }>;
  };
}

const STORAGE_PREFIX = 'github-explorer-chat-';

function loadChatHistory(owner: string, repo: string): ChatMessage[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(`${STORAGE_PREFIX}${owner}-${repo}`);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveChatHistory(owner: string, repo: string, messages: ChatMessage[]) {
  try {
    localStorage.setItem(
      `${STORAGE_PREFIX}${owner}-${repo}`,
      JSON.stringify(messages.slice(-50))
    );
  } catch {}
}

export default function RepoChat({ owner, repo, repoContext }: RepoChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [streaming, setStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const history = loadChatHistory(owner, repo);
    setMessages(history);
  }, [owner, repo]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async () => {
    const userMessage = input.trim();
    if (!userMessage || streaming) return;

    setInput('');
    setError(null);

    const newMessages: ChatMessage[] = [
      ...messages,
      { role: 'user', content: userMessage },
    ];
    setMessages(newMessages);
    setStreaming(true);

    const streamingMessages: ChatMessage[] = [
      ...newMessages,
      { role: 'assistant', content: '' },
    ];
    setMessages(streamingMessages);

    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          repoContext: { owner, repo, ...repoContext },
          messages: newMessages.slice(-10),
          userMessage,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error ?? 'Chat failed');
      }

      const reader = res.body!.getReader();
      const decoder = new TextDecoder();
      let assistantContent = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        assistantContent += decoder.decode(value, { stream: true });

        setMessages([
          ...newMessages,
          { role: 'assistant', content: assistantContent },
        ]);
      }

      const finalMessages: ChatMessage[] = [
        ...newMessages,
        { role: 'assistant', content: assistantContent },
      ];
      setMessages(finalMessages);
      saveChatHistory(owner, repo, finalMessages);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Chat failed';
      setError(message);
      setMessages(newMessages);
    } finally {
      setStreaming(false);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const clearHistory = () => {
    setMessages([]);
    localStorage.removeItem(`${STORAGE_PREFIX}${owner}-${repo}`);
  };

  const suggestions = [
    'What does this repository do?',
    'What technologies does it use?',
    'How is the project structured?',
  ];

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-lg flex flex-col overflow-hidden" style={{ height: '550px' }}>
      <div className="px-4 py-3 border-b border-zinc-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Bot size={15} className="text-zinc-400" />
          <h3 className="font-medium text-white text-sm">Repository AI Chat</h3>
        </div>
        {messages.length > 0 && (
          <button
            onClick={clearHistory}
            className="flex items-center gap-1 text-xs text-zinc-400 hover:text-white transition-colors"
            id="clear-chat-history-btn"
          >
            <RefreshCw size={12} />
            Clear
          </button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3 text-xs">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center gap-3 text-center">
            <MessageSquare size={24} className="text-zinc-600" />
            <p className="text-zinc-400 font-medium">Ask anything about {repo}</p>
            <div className="flex flex-wrap justify-center gap-1.5 max-w-sm mt-1">
              {suggestions.map((s) => (
                <button
                  key={s}
                  onClick={() => {
                    setInput(s);
                    setTimeout(() => inputRef.current?.focus(), 50);
                  }}
                  className="text-xs bg-zinc-950 border border-zinc-800 hover:border-zinc-700 text-zinc-300 px-2.5 py-1.5 rounded transition-colors"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        ) : (
          messages.map((msg, i) => (
            <div
              key={i}
              className={`flex gap-2 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[85%] rounded px-3 py-2 leading-relaxed ${
                  msg.role === 'user'
                    ? 'bg-white text-black font-medium'
                    : 'bg-zinc-950 border border-zinc-800 text-zinc-200'
                }`}
              >
                {msg.content ? (
                  <div className="whitespace-pre-wrap break-words">{msg.content}</div>
                ) : (
                  <div className="flex items-center gap-1.5 text-zinc-400">
                    <Loader2 size={12} className="animate-spin" />
                    <span>Thinking...</span>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {error && (
        <div className="px-3 py-1.5 bg-red-950/30 border-t border-red-900/50 flex items-center gap-2 text-red-400 text-xs">
          <AlertCircle size={12} />
          {error}
        </div>
      )}

      <div className="p-3 border-t border-zinc-800 flex items-center gap-2">
        <input
          ref={inputRef}
          id="repo-chat-input"
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={`Ask about ${repo}...`}
          disabled={streaming}
          className="flex-1 bg-zinc-950 border border-zinc-800 rounded px-3 py-1.5 text-xs text-white placeholder-zinc-500 outline-none focus:border-zinc-700"
        />
        <button
          onClick={sendMessage}
          disabled={!input.trim() || streaming}
          id="repo-chat-send-btn"
          className="bg-white text-black text-xs font-medium px-3 py-1.5 rounded disabled:opacity-40"
        >
          {streaming ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
        </button>
      </div>
    </div>
  );
}
