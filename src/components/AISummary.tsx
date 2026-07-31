'use client';

import { useState, useEffect, useRef } from 'react';
import { Bot, Sparkles, RefreshCw, ChevronDown, ChevronUp } from 'lucide-react';
import { GitHubUser, GitHubRepo } from '@/lib/github';

interface AISummaryProps {
  user: GitHubUser;
  repos: GitHubRepo[];
}

export default function AISummary({ user, repos }: AISummaryProps) {
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [expanded, setExpanded] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  const analyze = async () => {
    setLoading(true);
    setContent('');
    setDone(false);
    setError(null);
    setExpanded(true);

    try {
      const res = await fetch('/api/ai/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user, repos }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error ?? 'Analysis failed');
      }

      const reader = res.body!.getReader();
      const decoder = new TextDecoder();
      let accumulated = '';

      while (true) {
        const { done: streamDone, value } = await reader.read();
        if (streamDone) break;
        accumulated += decoder.decode(value, { stream: true });
        setContent(accumulated);
      }

      setDone(true);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Analysis failed';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const renderContent = (text: string) => {
    const lines = text.split('\n');
    return lines.map((line, i) => {
      if (line.startsWith('## ')) {
        return (
          <h3 key={i} className="text-accent-purple font-semibold text-sm mt-4 mb-1 first:mt-0">
            {line.replace('## ', '')}
          </h3>
        );
      }
      if (line.startsWith('### ')) {
        return (
          <h4 key={i} className="text-accent-blue font-medium text-sm mt-3 mb-1">
            {line.replace('### ', '')}
          </h4>
        );
      }
      if (line.startsWith('- ') || line.startsWith('* ')) {
        const content = line.replace(/^[-*] /, '');
        return (
          <li key={i} className="text-space-300 text-sm ml-3 list-disc leading-relaxed">
            <span dangerouslySetInnerHTML={{ __html: formatInline(content) }} />
          </li>
        );
      }
      if (line.trim() === '') {
        return <br key={i} />;
      }
      return (
        <p key={i} className="text-space-300 text-sm leading-relaxed">
          <span dangerouslySetInnerHTML={{ __html: formatInline(line) }} />
        </p>
      );
    });
  };

  return (
    <div className="glass rounded-2xl overflow-hidden">
      {/* Header */}
      <div className="px-5 py-4 flex items-center justify-between border-b border-space-700/50">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-accent-purple to-accent-pink flex items-center justify-center">
            <Sparkles size={16} className="text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-space-100 text-sm">AI Profile Analysis</h3>
            <p className="text-xs text-space-400">Powered by Groq Llama-3</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {(content || error) && (
            <button
              onClick={analyze}
              className="flex items-center gap-1.5 text-xs text-space-400 hover:text-space-200 transition-colors px-2 py-1 rounded-lg hover:bg-space-700/50"
              id="ai-refresh-btn"
            >
              <RefreshCw size={12} className={loading ? 'animate-spin' : ''} />
              Regenerate
            </button>
          )}
          {content && (
            <button
              onClick={() => setExpanded(!expanded)}
              className="p-1.5 rounded-lg hover:bg-space-700/50 text-space-400 hover:text-space-200 transition-colors"
            >
              {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </button>
          )}
        </div>
      </div>

      {/* Body */}
      <div className="px-5 py-4">
        {!content && !loading && !error && (
          <div className="flex flex-col items-center gap-4 py-6">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-accent-purple/20 to-accent-pink/20 flex items-center justify-center">
              <Bot size={24} className="text-accent-purple" />
            </div>
            <div className="text-center">
              <p className="text-space-200 text-sm font-medium">
                Get an AI-powered analysis of {user.name ?? user.login}&apos;s profile
              </p>
              <p className="text-space-500 text-xs mt-1">
                Developer archetype, skills, impact, and more
              </p>
            </div>
            <button
              onClick={analyze}
              id="ai-analyze-btn"
              className="btn-primary text-sm px-5 py-2.5 flex items-center gap-2 relative z-10"
            >
              <Sparkles size={16} />
              Analyze Profile
            </button>
          </div>
        )}

        {loading && !content && (
          <div className="flex items-center gap-3 py-4">
            <div className="flex gap-1">
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className="w-2 h-2 rounded-full bg-accent-purple animate-bounce"
                  style={{ animationDelay: `${i * 0.1}s` }}
                />
              ))}
            </div>
            <span className="text-space-400 text-sm">Analyzing profile...</span>
          </div>
        )}

        {error && (
          <div className="flex items-center gap-2 py-4 text-red-400 text-sm">
            <span>⚠️ {error}</span>
            <button
              onClick={analyze}
              className="text-xs underline hover:no-underline"
            >
              Try again
            </button>
          </div>
        )}

        {content && expanded && (
          <div ref={contentRef} className="prose-custom">
            {renderContent(content)}
            {loading && <span className="streaming-cursor" />}
          </div>
        )}

        {content && !expanded && (
          <p className="text-space-400 text-sm italic">Analysis hidden — click ↑ to expand</p>
        )}
      </div>
    </div>
  );
}

function formatInline(text: string): string {
  return text
    .replace(/\*\*(.+?)\*\*/g, '<strong class="text-space-200">$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/`(.+?)`/g, '<code class="text-accent-cyan text-xs bg-space-700/50 px-1 rounded">$1</code>');
}
