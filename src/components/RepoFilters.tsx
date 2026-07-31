'use client';

import { useState, useMemo } from 'react';
import { Search, Star, GitFork, Clock, Filter, SortAsc } from 'lucide-react';
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
    { key: 'stars', label: 'Stars', icon: <Star size={13} /> },
    { key: 'forks', label: 'Forks', icon: <GitFork size={13} /> },
    { key: 'updated', label: 'Updated', icon: <Clock size={13} /> },
    { key: 'name', label: 'Name', icon: <SortAsc size={13} /> },
  ];

  return (
    <div className="space-y-4">
      {/* Controls */}
      <div className="glass rounded-xl p-4 space-y-3">
        <div className="flex items-center gap-2 flex-wrap">
          {/* Search */}
          <div className="flex-1 min-w-48 relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-space-400" />
            <input
              id="repo-search-input"
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Filter repositories..."
              className="input-field text-sm pl-8 py-2"
            />
          </div>

          {/* Language filter */}
          {languages.length > 0 && (
            <select
              value={langFilter}
              onChange={(e) => setLangFilter(e.target.value)}
              id="language-filter"
              className="input-field text-sm py-2 w-auto min-w-32"
            >
              <option value="">All Languages</option>
              {languages.map((lang) => (
                <option key={lang} value={lang}>
                  {lang}
                </option>
              ))}
            </select>
          )}

          {/* Fork toggle */}
          <label className="flex items-center gap-2 text-sm text-space-300 cursor-pointer">
            <input
              type="checkbox"
              checked={showForked}
              onChange={(e) => setShowForked(e.target.checked)}
              className="rounded"
            />
            Show forks
          </label>
        </div>

        {/* Sort buttons */}
        <div className="flex items-center gap-1 flex-wrap">
          <span className="text-xs text-space-400 mr-1 flex items-center gap-1">
            <Filter size={12} />
            Sort:
          </span>
          {sortOptions.map(({ key, label, icon }) => (
            <button
              key={key}
              onClick={() => setSort(key)}
              className={`flex items-center gap-1 text-xs px-3 py-1.5 rounded-lg transition-all ${
                sort === key
                  ? 'bg-accent-purple/20 text-accent-purple border border-accent-purple/30'
                  : 'text-space-400 hover:text-space-200 hover:bg-space-700/50 border border-transparent'
              }`}
            >
              {icon}
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Results header */}
      <div className="flex items-center justify-between">
        <p className="text-space-400 text-sm">
          Showing{' '}
          <span className="text-space-200 font-medium">{filtered.length}</span>{' '}
          of {repos.length} repositories
        </p>
      </div>

      {/* Repo grid */}
      {filtered.length === 0 ? (
        <div className="glass rounded-xl p-10 text-center">
          <p className="text-space-400 text-sm">No repositories match your filters</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {filtered.map((repo) => (
            <RepoCard key={repo.id} repo={repo} owner={username} />
          ))}
        </div>
      )}
    </div>
  );
}
