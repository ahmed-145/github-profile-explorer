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
    <div className="relative w-full max-w-xl mx-auto">
      <form onSubmit={handleSubmit}>
        <div className="flex items-center gap-2 bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 transition-colors focus-within:border-zinc-600">
          <Search size={16} className="text-zinc-500 shrink-0" />
          <input
            ref={inputRef}
            id="github-username-search"
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => setFocused(true)}
            onBlur={() => setTimeout(() => setFocused(false), 150)}
            onKeyDown={handleKeyDown}
            placeholder="Search GitHub username..."
            className="flex-1 bg-transparent text-white placeholder-zinc-500 outline-none text-sm"
            autoComplete="off"
            spellCheck={false}
          />
          {loading ? (
            <Loader2 className="shrink-0 text-zinc-400 animate-spin" size={16} />
          ) : (
            <button
              type="submit"
              disabled={!query.trim()}
              id="search-submit-btn"
              className="bg-white text-black text-xs font-medium px-3 py-1.5 rounded disabled:opacity-40"
            >
              Search
            </button>
          )}
        </div>
      </form>

      {showDropdown && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-zinc-900 border border-zinc-800 rounded-lg overflow-hidden z-50">
          <div className="px-3 py-1.5 text-xs text-zinc-500 font-medium flex items-center gap-1">
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
              className="w-full flex items-center gap-2 px-3 py-2 hover:bg-zinc-800 transition-colors text-left text-xs text-zinc-300"
            >
              <GitBranch size={13} className="text-zinc-500 shrink-0" />
              <span>{username}</span>
            </button>
          ))}
        </div>
      )}

      <div className="flex items-center justify-center gap-1 mt-2 text-xs text-zinc-500">
        <Users size={12} />
        <span>
          Comparing users?{' '}
          <button
            onClick={() => router.push('/compare')}
            className="text-zinc-300 hover:text-white underline underline-offset-2"
          >
            Go to Compare
          </button>
        </span>
      </div>
    </div>
  );
}
