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
  Go: '#00ADD8',
  Rust: '#dea584',
};

export default function RepoCard({ repo, owner }: RepoCardProps) {
  const langColor = repo.language ? (LANGUAGE_COLORS[repo.language] ?? '#71717a') : null;
  const updatedAt = formatDistanceToNow(new Date(repo.pushed_at), { addSuffix: true });

  return (
    <div className="bg-zinc-900 border border-zinc-800 hover:border-zinc-700 rounded-lg p-4 flex flex-col justify-between gap-3 group transition-colors">
      <div>
        <div className="flex items-start justify-between gap-2 mb-1.5">
          <Link
            href={`/repo/${owner}/${repo.name}`}
            className="font-medium text-white hover:underline text-sm truncate"
            id={`repo-link-${repo.name}`}
          >
            {repo.name}
          </Link>
          <a
            href={repo.html_url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-zinc-500 hover:text-zinc-300 transition-colors p-1"
          >
            <ExternalLink size={13} />
          </a>
        </div>

        {repo.description && (
          <p className="text-zinc-400 text-xs line-clamp-2 leading-relaxed mb-3">
            {repo.description}
          </p>
        )}

        {repo.topics && repo.topics.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {repo.topics.slice(0, 4).map((topic) => (
              <span key={topic} className="px-2 py-0.5 rounded bg-zinc-800 text-zinc-400 text-[11px]">
                {topic}
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="pt-2 border-t border-zinc-800/80 flex items-center justify-between text-xs text-zinc-500">
        <div className="flex items-center gap-3">
          {langColor && repo.language && (
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: langColor }} />
              {repo.language}
            </span>
          )}
          <span className="flex items-center gap-1">
            <Star size={12} />
            {repo.stargazers_count}
          </span>
          <span className="flex items-center gap-1">
            <GitFork size={12} />
            {repo.forks_count}
          </span>
        </div>

        <Link
          href={`/repo/${owner}/${repo.name}`}
          className="text-zinc-400 hover:text-white flex items-center gap-1 transition-colors"
        >
          <MessageSquare size={12} />
          Chat
        </Link>
      </div>
    </div>
  );
}
