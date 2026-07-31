'use client';

import { useState, useMemo } from 'react';
import { Search, Star, GitFork, Clock, SortAsc } from 'lucide-react';
import RepoCard from '@/components/RepoCard';
import { GitHubRepo } from '@/lib/github';

type SortKey = 'stars' | 'forks' | 'updated' | 'name';

interface RepoFiltersProps {
  username: string;
  repos: GitHubRepo[];
}

export default function RepoFilters({ username, repos }: RepoFiltersProps) {
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState<SortKey>('stars');
  const [langFilter, setLangFilter] = useState('');
  const [showForked, setShowForked] = useState(true);

  const languages = useMemo(() => {
    const langs = repos
      .filter((r) => r.language)
      .map((r) => r.language!);
    return Array.from(new Set(langs)).sort();
  }, [repos]);

  const filtered = useMemo(() => {
    let result = [...repos];

    if (!showForked) result = result.filter((r) => !r.fork);
    if (langFilter) result = result.filter((r) => r.language === langFilter);
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        (r) =>
          r.name.toLowerCase().includes(q) ||
          (r.description ?? '').toLowerCase().includes(q) ||
          r.topics.some((t) => t.includes(q))
      );
    }

    switch (sort) {
      case 'stars':
        result.sort((a, b) => b.stargazers_count - a.stargazers_count);
        break;
      case 'forks':
        result.sort((a, b) => b.forks_count - a.forks_count);
        break;
      case 'updated':
        result.sort((a, b) => new Date(b.pushed_at).getTime() - new Date(a.pushed_at).getTime());
        break;
      case 'name':
        result.sort((a, b) => a.name.localeCompare(b.name));
        break;
    }

    return result;
  }, [repos, search, sort, langFilter, showForked]);

  const sortOptions: { key: SortKey; label: string; icon: React.ReactNode }[] = [
    { key: 'stars', label: 'Stars', icon: <Star size={12} /> },
    { key: 'forks', label: 'Forks', icon: <GitFork size={12} /> },
    { key: 'updated', label: 'Updated', icon: <Clock size={12} /> },
    { key: 'name', label: 'Name', icon: <SortAsc size={12} /> },
  ];

  return (
    <div className="space-y-4">
      <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-3 space-y-2.5">
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex-1 min-w-44 relative">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
            <input
              id="repo-search-input"
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Filter repos..."
              className="bg-zinc-950 border border-zinc-800 rounded text-xs pl-8 pr-3 py-1.5 text-white outline-none focus:border-zinc-700 w-full"
            />
          </div>

          {languages.length > 0 && (
            <select
              value={langFilter}
              onChange={(e) => setLangFilter(e.target.value)}
              id="language-filter"
              className="bg-zinc-950 border border-zinc-800 rounded text-xs px-2.5 py-1.5 text-zinc-300 outline-none"
            >
              <option value="">All Languages</option>
              {languages.map((lang) => (
                <option key={lang} value={lang}>
                  {lang}
                </option>
              ))}
            </select>
          )}

          <label className="flex items-center gap-1.5 text-xs text-zinc-400 cursor-pointer">
            <input
              type="checkbox"
              checked={showForked}
              onChange={(e) => setShowForked(e.target.checked)}
              className="rounded bg-zinc-950 border-zinc-800"
            />
            Forks
          </label>
        </div>

        <div className="flex items-center gap-1 flex-wrap text-xs text-zinc-400">
          <span className="mr-1">Sort:</span>
          {sortOptions.map(({ key, label, icon }) => (
            <button
              key={key}
              onClick={() => setSort(key)}
              className={`flex items-center gap-1 px-2.5 py-1 rounded transition-colors ${
                sort === key
                  ? 'bg-zinc-800 text-white font-medium'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              {icon}
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-between text-xs text-zinc-400">
        <span>
          Showing <span className="text-white font-medium">{filtered.length}</span> of {repos.length} repositories
        </span>
      </div>

      {filtered.length === 0 ? (
        <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-8 text-center text-xs text-zinc-500">
          No repositories found
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {filtered.map((repo) => (
            <RepoCard key={repo.id} repo={repo} owner={username} />
          ))}
        </div>
      )}
    </div>
  );
}
