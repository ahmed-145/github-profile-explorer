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
    'What are the recent changes?',
  ];

  return (
    <div className="glass rounded-2xl flex flex-col overflow-hidden" style={{ height: '600px' }}>
      <div className="px-5 py-4 border-b border-space-700/50 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-accent-purple to-accent-blue flex items-center justify-center">
            <Bot size={16} className="text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-space-100 text-sm">Repository Chat</h3>
            <p className="text-xs text-space-400">
              Grounded in README, commits & file structure
            </p>
          </div>
        </div>
        {messages.length > 0 && (
          <button
            onClick={clearHistory}
            className="flex items-center gap-1.5 text-xs text-space-400 hover:text-space-200 transition-colors px-2 py-1 rounded-lg hover:bg-space-700/50"
            id="clear-chat-history-btn"
          >
            <RefreshCw size={12} />
            Clear
          </button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-accent-purple/20 to-accent-blue/20 flex items-center justify-center">
              <MessageSquare size={28} className="text-accent-purple" />
            </div>
            <div className="text-center">
              <p className="text-space-300 text-sm font-medium">Chat about {repo}</p>
              <p className="text-space-500 text-xs mt-1">
                Ask anything about this repository
              </p>
            </div>
            <div className="grid grid-cols-2 gap-2 w-full max-w-sm mt-2">
              {suggestions.map((s) => (
                <button
                  key={s}
                  onClick={() => {
                    setInput(s);
                    setTimeout(() => inputRef.current?.focus(), 50);
                  }}
                  className="text-xs text-left p-2.5 rounded-lg border border-space-700 hover:border-accent-purple/40 hover:bg-accent-purple/5 text-space-300 transition-all"
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
              className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
            >
              <div
                className={`shrink-0 w-7 h-7 rounded-lg flex items-center justify-center text-white ${
                  msg.role === 'assistant'
                    ? 'bg-gradient-to-br from-accent-purple to-accent-blue'
                    : 'bg-gradient-to-br from-accent-cyan to-accent-blue'
                }`}
              >
                {msg.role === 'assistant' ? <Bot size={14} /> : <User size={14} />}
              </div>

              <div
                className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                  msg.role === 'user'
                    ? 'bg-accent-purple/10 border border-accent-purple/20 text-space-100 rounded-tr-sm'
                    : 'bg-space-800/60 border border-space-700/50 text-space-200 rounded-tl-sm'
                } ${
                  streaming && i === messages.length - 1 && msg.role === 'assistant' && msg.content === ''
                    ? 'streaming-cursor'
                    : ''
                }`}
              >
                {msg.content ? (
                  <div className="whitespace-pre-wrap break-words">
                    {msg.content}
                    {streaming && i === messages.length - 1 && msg.role === 'assistant' && (
                      <span className="streaming-cursor" />
                    )}
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-space-400">
                    <Loader2 size={14} className="animate-spin" />
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
        <div className="px-4 py-2 bg-red-500/10 border-t border-red-500/20 flex items-center gap-2 text-red-400 text-xs">
          <AlertCircle size={14} />
          {error}
        </div>
      )}

      <div className="px-4 py-3 border-t border-space-700/50 flex items-center gap-3">
        <input
          ref={inputRef}
          id="repo-chat-input"
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={`Ask about ${repo}...`}
          disabled={streaming}
          className="input-field text-sm py-2"
        />
        <button
          onClick={sendMessage}
          disabled={!input.trim() || streaming}
          id="repo-chat-send-btn"
          className="btn-primary px-3 py-2 flex items-center gap-1.5 text-sm shrink-0 disabled:opacity-40 disabled:cursor-not-allowed relative z-10"
        >
          {streaming ? (
            <Loader2 size={16} className="animate-spin" />
          ) : (
            <Send size={16} />
          )}
        </button>
      </div>
    </div>
  );
}
