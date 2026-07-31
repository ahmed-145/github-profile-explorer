'use client';

import { useState, useRef } from 'react';
import { Bot, Sparkles, RefreshCw, ChevronDown, ChevronUp } from 'lucide-react';
import { GitHubUser, GitHubRepo } from '@/lib/github';

interface AISummaryProps {
  user: GitHubUser;
  repos: GitHubRepo[];
}

export default function AISummary({ user, repos }: AISummaryProps) {
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  const analyze = async () => {
    setLoading(true);
    setContent('');
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
          <h3 key={i} className="text-white font-medium text-sm mt-3 mb-1 first:mt-0">
            {line.replace('## ', '')}
          </h3>
        );
      }
      if (line.startsWith('### ')) {
        return (
          <h4 key={i} className="text-zinc-200 font-medium text-xs mt-2 mb-1">
            {line.replace('### ', '')}
          </h4>
        );
      }
      if (line.startsWith('- ') || line.startsWith('* ')) {
        const content = line.replace(/^[-*] /, '');
        return (
          <li key={i} className="text-zinc-300 text-xs ml-3 list-disc leading-relaxed">
            <span dangerouslySetInnerHTML={{ __html: formatInline(content) }} />
          </li>
        );
      }
      if (line.trim() === '') {
        return <br key={i} />;
      }
      return (
        <p key={i} className="text-zinc-300 text-xs leading-relaxed">
          <span dangerouslySetInnerHTML={{ __html: formatInline(line) }} />
        </p>
      );
    });
  };

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-lg overflow-hidden">
      <div className="px-4 py-3 border-b border-zinc-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles size={15} className="text-zinc-400" />
          <h3 className="font-medium text-white text-sm">AI Profile Analysis</h3>
        </div>
        <div className="flex items-center gap-2">
          {(content || error) && (
            <button
              onClick={analyze}
              className="flex items-center gap-1 text-xs text-zinc-400 hover:text-white transition-colors"
              id="ai-refresh-btn"
            >
              <RefreshCw size={12} className={loading ? 'animate-spin' : ''} />
              Refresh
            </button>
          )}
          {content && (
            <button
              onClick={() => setExpanded(!expanded)}
              className="text-zinc-400 hover:text-white transition-colors"
            >
              {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            </button>
          )}
        </div>
      </div>

      <div className="p-4">
        {!content && !loading && !error && (
          <div className="flex flex-col items-center gap-3 py-4 text-center">
            <Bot size={20} className="text-zinc-500" />
            <p className="text-zinc-400 text-xs">
              Generate AI profile analysis for {user.name ?? user.login}
            </p>
            <button
              onClick={analyze}
              id="ai-analyze-btn"
              className="bg-white text-black text-xs font-medium px-4 py-2 rounded hover:bg-zinc-200 transition-colors flex items-center gap-1.5"
            >
              <Sparkles size={13} />
              Analyze Profile
            </button>
          </div>
        )}

        {loading && !content && (
          <div className="flex items-center gap-2 py-3 text-xs text-zinc-400">
            <RefreshCw size={12} className="animate-spin" />
            <span>Analyzing profile data...</span>
          </div>
        )}

        {error && (
          <div className="py-2 text-red-400 text-xs flex items-center gap-2">
            <span>{error}</span>
            <button onClick={analyze} className="underline">Retry</button>
          </div>
        )}

        {content && expanded && (
          <div ref={contentRef} className="space-y-1">
            {renderContent(content)}
            {loading && <span className="streaming-cursor" />}
          </div>
        )}
      </div>
    </div>
  );
}

function formatInline(text: string): string {
  const escaped = text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
  return escaped
    .replace(/\*\*(.+?)\*\*/g, '<strong class="text-white">$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/`(.+?)`/g, '<code class="text-zinc-300 text-xs bg-zinc-800 px-1 rounded">$1</code>');
}
