'use client';

import Link from 'next/link';
import { Star, GitFork, Eye, Code2, Clock, ExternalLink, MessageSquare } from 'lucide-react';
import { GitHubRepo } from '@/lib/github';
import { formatDistanceToNow } from 'date-fns';

interface RepoCardProps {
  repo: GitHubRepo;
  owner: string;
}

const LANGUAGE_COLORS: Record<string, string> = {
  TypeScript: '#3178c6',
  JavaScript: '#f7df1e',
  Python: '#3572A5',
  Java: '#b07219',
  'C++': '#f34b7d',
  C: '#555555',
  Go: '#00ADD8',
  Rust: '#dea584',
  Ruby: '#701516',
  PHP: '#4F5D95',
  Swift: '#F05138',
  Kotlin: '#A97BFF',
  Dart: '#00B4AB',
  HTML: '#e34c26',
  CSS: '#563d7c',
  Shell: '#89e051',
  Vue: '#41b883',
  Svelte: '#ff3e00',
  'C#': '#178600',
  R: '#198CE7',
};

export default function RepoCard({ repo, owner }: RepoCardProps) {
  const langColor = repo.language ? (LANGUAGE_COLORS[repo.language] ?? '#8b949e') : null;
  const updatedAt = formatDistanceToNow(new Date(repo.pushed_at), { addSuffix: true });

  return (
    <div className="glass rounded-xl p-5 card-hover flex flex-col gap-3 group">
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <Link
              href={`/repo/${owner}/${repo.name}`}
              className="font-semibold text-accent-blue hover:text-accent-purple transition-colors text-sm truncate"
              id={`repo-link-${repo.name}`}
            >
              {repo.name}
            </Link>
            {repo.archived && (
              <span className="text-xs px-1.5 py-0.5 rounded border border-space-500 text-space-400">
                Archived
              </span>
            )}
            {repo.fork && (
              <span className="text-xs px-1.5 py-0.5 rounded border border-space-600 text-space-400 flex items-center gap-0.5">
                <GitFork size={10} />
                Fork
              </span>
            )}
            {repo.visibility === 'public' && (
              <span className="text-xs px-1.5 py-0.5 rounded border border-accent-green/30 text-accent-green/80">
                Public
              </span>
            )}
          </div>
          {repo.description && (
            <p className="text-space-300 text-xs mt-1.5 line-clamp-2 leading-relaxed">
              {repo.description}
            </p>
          )}
        </div>
        <a
          href={repo.html_url}
          target="_blank"
          rel="noopener noreferrer"
          className="shrink-0 p-1.5 rounded-lg hover:bg-space-700 transition-colors text-space-400 hover:text-space-200"
          aria-label="Open on GitHub"
        >
          <ExternalLink size={14} />
        </a>
      </div>

      {/* Topics */}
      {repo.topics && repo.topics.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {repo.topics.slice(0, 5).map((topic) => (
            <span key={topic} className="tag text-xs">
              {topic}
            </span>
          ))}
          {repo.topics.length > 5 && (
            <span className="text-xs text-space-400">+{repo.topics.length - 5}</span>
          )}
        </div>
      )}

      {/* Stats row */}
      <div className="flex items-center gap-4 text-xs text-space-400 flex-wrap">
        {langColor && repo.language && (
          <span className="flex items-center gap-1.5">
            <span
              className="w-2.5 h-2.5 rounded-full"
              style={{ backgroundColor: langColor }}
            />
            <Code2 size={12} />
            {repo.language}
          </span>
        )}
        <span className="flex items-center gap-1">
          <Star size={12} className="text-yellow-400" />
          {repo.stargazers_count.toLocaleString()}
        </span>
        <span className="flex items-center gap-1">
          <GitFork size={12} />
          {repo.forks_count.toLocaleString()}
        </span>
        <span className="flex items-center gap-1">
          <Eye size={12} />
          {repo.watchers_count.toLocaleString()}
        </span>
        {repo.open_issues_count > 0 && (
          <span className="text-space-400">{repo.open_issues_count} issues</span>
        )}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-1 border-t border-space-700/50">
        <span className="flex items-center gap-1 text-xs text-space-500">
          <Clock size={11} />
          Updated {updatedAt}
        </span>
        <Link
          href={`/repo/${owner}/${repo.name}`}
          className="flex items-center gap-1 text-xs text-accent-purple hover:text-accent-blue transition-colors opacity-0 group-hover:opacity-100"
          id={`repo-chat-link-${repo.name}`}
        >
          <MessageSquare size={11} />
          Chat with AI
        </Link>
      </div>
    </div>
  );
}
