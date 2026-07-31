'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Search, GitBranch, Users, Loader2, Clock } from 'lucide-react';

const RECENT_SEARCHES_KEY = 'github-explorer-recent';

function getRecentSearches(): string[] {
  if (typeof window === 'undefined') return [];
  try {
    return JSON.parse(localStorage.getItem(RECENT_SEARCHES_KEY) ?? '[]');
  } catch {
    return [];
  }
}

function saveRecentSearch(username: string) {
  const recent = getRecentSearches().filter((u) => u !== username);
  recent.unshift(username);
  localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(recent.slice(0, 8)));
}

export default function SearchBar() {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [focused, setFocused] = useState(false);
  const [recent, setRecent] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setRecent(getRecentSearches());
  }, []);

  const handleSearch = async (username: string) => {
    const trimmed = username.trim();
    if (!trimmed) return;
    setLoading(true);
    saveRecentSearch(trimmed);
    router.push(`/user/${trimmed}`);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSearch(query);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setFocused(false);
      inputRef.current?.blur();
    }
  };

  const showDropdown = focused && recent.length > 0 && !loading;

  return (
    <div className="relative w-full max-w-2xl mx-auto">
      <form onSubmit={handleSubmit}>
        <div
          className={`flex items-center gap-3 glass rounded-xl px-4 py-3 transition-all duration-300 ${
            focused
              ? 'border-accent-purple/60 shadow-glow-purple'
              : 'border-space-600/60'
          }`}
        >
          <Search
            className={`shrink-0 transition-colors duration-200 ${
              focused ? 'text-accent-purple' : 'text-space-400'
            }`}
            size={20}
          />
          <input
            ref={inputRef}
            id="github-username-search"
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => setFocused(true)}
            onBlur={() => setTimeout(() => setFocused(false), 150)}
            onKeyDown={handleKeyDown}
            placeholder="Enter a GitHub username (e.g. octocat)"
            className="flex-1 bg-transparent text-space-100 placeholder-space-400 outline-none text-base"
            autoComplete="off"
            spellCheck={false}
          />
          {loading ? (
            <Loader2 className="shrink-0 text-accent-purple animate-spin" size={20} />
          ) : (
            <button
              type="submit"
              disabled={!query.trim()}
              id="search-submit-btn"
              className="btn-primary text-sm px-4 py-1.5 disabled:opacity-40 disabled:cursor-not-allowed relative z-10"
            >
              Search
            </button>
          )}
        </div>
      </form>

      {/* Recent searches dropdown */}
      {showDropdown && (
        <div className="absolute top-full left-0 right-0 mt-2 glass rounded-xl overflow-hidden z-50 shadow-card">
          <div className="px-3 py-2 text-xs text-space-400 font-medium flex items-center gap-1.5">
            <Clock size={12} />
            Recent searches
          </div>
          {recent.map((username) => (
            <button
              key={username}
              onClick={() => {
                setQuery(username);
                handleSearch(username);
              }}
              className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-space-700/50 transition-colors text-left"
            >
              <GitBranch size={14} className="text-space-400 shrink-0" />
              <span className="text-space-200 text-sm">{username}</span>
            </button>
          ))}
        </div>
      )}

      {/* Compare hint */}
      <div className="flex items-center justify-center gap-2 mt-3">
        <Users size={14} className="text-space-400" />
        <span className="text-space-400 text-xs">
          Want to compare two users?{' '}
          <button
            onClick={() => router.push('/compare')}
            className="text-accent-purple hover:text-accent-blue transition-colors underline underline-offset-2"
          >
            Go to Compare
          </button>
        </span>
      </div>
    </div>
  );
}
