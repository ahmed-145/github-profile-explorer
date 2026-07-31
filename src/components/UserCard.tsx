'use client';

import Image from 'next/image';
import Link from 'next/link';
import {
  MapPin,
  Link as LinkIcon,
  Twitter,
  Building2,
  Users,
  BookOpen,
  Star,
  Calendar,
  GitFork,
} from 'lucide-react';
import { GitHubUser, GitHubRepo, computeUserMetrics } from '@/lib/github';
import { format } from 'date-fns';

interface UserCardProps {
  user: GitHubUser;
  repos: GitHubRepo[];
  compact?: boolean;
}

export default function UserCard({ user, repos, compact = false }: UserCardProps) {
  const metrics = computeUserMetrics(user, repos);

  const topLangs = Object.entries(metrics.languages)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  const totalLangCount = topLangs.reduce((sum, [, c]) => sum + c, 0);

  if (compact) {
    return (
      <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4 flex items-center gap-3">
        <Image
          src={user.avatar_url}
          alt={user.login}
          width={40}
          height={40}
          className="rounded-full border border-zinc-700"
        />
        <div className="flex-1 min-w-0">
          <Link
            href={`/user/${user.login}`}
            className="font-medium text-white hover:underline text-sm truncate block"
          >
            {user.name ?? user.login}
          </Link>
          <p className="text-zinc-500 text-xs truncate">@{user.login}</p>
        </div>
        <div className="flex gap-3 text-xs text-zinc-400 shrink-0">
          <span>{user.followers} followers</span>
          <span>{user.public_repos} repos</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-4">
          <Image
            src={user.avatar_url}
            alt={user.name ?? user.login}
            width={64}
            height={64}
            className="rounded-full border border-zinc-700"
          />
          <div>
            <h2 className="text-lg font-bold text-white">{user.name ?? user.login}</h2>
            <p className="text-zinc-400 text-sm font-mono">@{user.login}</p>
          </div>
        </div>

        <div className="flex gap-2">
          <a
            href={user.html_url}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-zinc-800 border border-zinc-700 text-zinc-300 text-xs px-3 py-1.5 rounded hover:text-white transition-colors flex items-center gap-1"
          >
            <LinkIcon size={12} />
            GitHub
          </a>
          <Link
            href={`/compare?user1=${user.login}`}
            className="bg-zinc-800 border border-zinc-700 text-zinc-300 text-xs px-3 py-1.5 rounded hover:text-white transition-colors flex items-center gap-1"
          >
            <Users size={12} />
            Compare
          </Link>
        </div>
      </div>

      {user.bio && <p className="text-zinc-300 text-sm mb-4 leading-relaxed">{user.bio}</p>}

      <div className="flex flex-wrap gap-x-4 gap-y-1.5 mb-5 text-xs text-zinc-400">
        {user.company && (
          <span className="flex items-center gap-1">
            <Building2 size={13} />
            {user.company}
          </span>
        )}
        {user.location && (
          <span className="flex items-center gap-1">
            <MapPin size={13} />
            {user.location}
          </span>
        )}
        {user.blog && (
          <a
            href={user.blog.startsWith('http') ? user.blog : `https://${user.blog}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 hover:text-white transition-colors"
          >
            <LinkIcon size={13} />
            {user.blog.replace(/^https?:\/\//, '')}
          </a>
        )}
        {user.twitter_username && (
          <a
            href={`https://twitter.com/${user.twitter_username}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 hover:text-white transition-colors"
          >
            <Twitter size={13} />@{user.twitter_username}
          </a>
        )}
        <span className="flex items-center gap-1">
          <Calendar size={13} />
          Joined {format(new Date(user.created_at), 'MMM yyyy')}
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-5">
        {[
          { label: 'Followers', value: user.followers.toLocaleString(), icon: Users },
          { label: 'Following', value: user.following.toLocaleString(), icon: Users },
          { label: 'Repos', value: user.public_repos.toLocaleString(), icon: BookOpen },
          { label: 'Total Stars', value: metrics.totalStars.toLocaleString(), icon: Star },
        ].map(({ label, value, icon: Icon }) => (
          <div key={label} className="bg-zinc-950 border border-zinc-800 rounded p-3 text-center">
            <Icon size={14} className="mx-auto text-zinc-500 mb-1" />
            <span className="text-base font-semibold text-white block">{value}</span>
            <span className="text-xs text-zinc-500">{label}</span>
          </div>
        ))}
      </div>

      {topLangs.length > 0 && (
        <div>
          <p className="text-xs text-zinc-400 mb-2">Languages</p>
          <div className="flex h-1.5 rounded-full overflow-hidden gap-0.5 mb-2 bg-zinc-800">
            {topLangs.map(([lang, count]) => {
              const pct = (count / totalLangCount) * 100;
              return (
                <div
                  key={lang}
                  style={{
                    width: `${pct}%`,
                    backgroundColor: getLanguageColor(lang),
                  }}
                  title={`${lang}: ${count} repos`}
                />
              );
            })}
          </div>
          <div className="flex flex-wrap gap-x-3 gap-y-1">
            {topLangs.map(([lang, count]) => (
              <span key={lang} className="flex items-center gap-1 text-xs text-zinc-400">
                <span
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: getLanguageColor(lang) }}
                />
                {lang} ({count})
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function getLanguageColor(lang: string): string {
  const colors: Record<string, string> = {
    TypeScript: '#3178c6',
    JavaScript: '#f7df1e',
    Python: '#3572A5',
    Java: '#b07219',
    'C++': '#f34b7d',
    Go: '#00ADD8',
    Rust: '#dea584',
    Ruby: '#701516',
    PHP: '#4F5D95',
    HTML: '#e34c26',
    CSS: '#563d7c',
  };
  return colors[lang] ?? '#71717a';
}
