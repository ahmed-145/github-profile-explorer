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
      <div className="glass rounded-xl p-4 flex items-center gap-4">
        <Image
          src={user.avatar_url}
          alt={user.login}
          width={48}
          height={48}
          className="rounded-full border-2 border-accent-purple/30"
        />
        <div className="flex-1 min-w-0">
          <Link
            href={`/user/${user.login}`}
            className="font-semibold text-space-100 hover:text-accent-purple transition-colors truncate block"
          >
            {user.name ?? user.login}
          </Link>
          <p className="text-space-400 text-sm truncate">@{user.login}</p>
        </div>
        <div className="flex gap-3 text-xs text-space-300 shrink-0">
          <span className="flex items-center gap-1">
            <Users size={12} className="text-accent-purple" />
            {user.followers.toLocaleString()}
          </span>
          <span className="flex items-center gap-1">
            <BookOpen size={12} className="text-accent-blue" />
            {user.public_repos}
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="glass rounded-2xl overflow-hidden">
      {/* Header gradient */}
      <div className="h-24 bg-gradient-to-r from-accent-purple/20 via-accent-blue/20 to-accent-cyan/20 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-space-800/80" />
      </div>

      <div className="px-6 pb-6 -mt-12 relative">
        {/* Avatar */}
        <div className="flex items-end justify-between mb-4">
          <div className="relative">
            <Image
              src={user.avatar_url}
              alt={user.name ?? user.login}
              width={80}
              height={80}
              className="rounded-full border-4 border-space-800 shadow-glow-purple"
            />
            <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-accent-green rounded-full border-2 border-space-800" />
          </div>
          <div className="flex gap-2 mb-2">
            <a
              href={user.html_url}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-secondary text-xs px-3 py-1.5 flex items-center gap-1"
            >
              <LinkIcon size={12} />
              GitHub
            </a>
            <Link
              href={`/compare?user1=${user.login}`}
              className="btn-secondary text-xs px-3 py-1.5 flex items-center gap-1"
            >
              <Users size={12} />
              Compare
            </Link>
          </div>
        </div>

        {/* Name & bio */}
        <div className="mb-4">
          <h2 className="text-xl font-bold text-space-100">{user.name ?? user.login}</h2>
          <p className="text-space-400 text-sm font-mono">@{user.login}</p>
          {user.bio && <p className="text-space-300 text-sm mt-2 leading-relaxed">{user.bio}</p>}
        </div>

        {/* Meta info */}
        <div className="flex flex-wrap gap-x-4 gap-y-1.5 mb-5 text-sm text-space-300">
          {user.company && (
            <span className="flex items-center gap-1.5">
              <Building2 size={14} className="text-space-400" />
              {user.company}
            </span>
          )}
          {user.location && (
            <span className="flex items-center gap-1.5">
              <MapPin size={14} className="text-space-400" />
              {user.location}
            </span>
          )}
          {user.blog && (
            <a
              href={user.blog.startsWith('http') ? user.blog : `https://${user.blog}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 hover:text-accent-purple transition-colors"
            >
              <LinkIcon size={14} className="text-space-400" />
              {user.blog.replace(/^https?:\/\//, '')}
            </a>
          )}
          {user.twitter_username && (
            <a
              href={`https://twitter.com/${user.twitter_username}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 hover:text-accent-blue transition-colors"
            >
              <Twitter size={14} className="text-space-400" />@{user.twitter_username}
            </a>
          )}
          <span className="flex items-center gap-1.5">
            <Calendar size={14} className="text-space-400" />
            Joined {format(new Date(user.created_at), 'MMM yyyy')}
          </span>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
          {[
            { label: 'Followers', value: user.followers.toLocaleString(), icon: Users, color: 'text-accent-purple' },
            { label: 'Following', value: user.following.toLocaleString(), icon: Users, color: 'text-accent-blue' },
            { label: 'Repos', value: user.public_repos.toLocaleString(), icon: BookOpen, color: 'text-accent-cyan' },
            { label: 'Total Stars', value: metrics.totalStars.toLocaleString(), icon: Star, color: 'text-yellow-400' },
          ].map(({ label, value, icon: Icon, color }) => (
            <div key={label} className="stat-card">
              <Icon size={16} className={color} />
              <span className="text-lg font-bold text-space-100">{value}</span>
              <span className="text-xs text-space-400">{label}</span>
            </div>
          ))}
        </div>

        {/* Additional metrics */}
        <div className="grid grid-cols-3 gap-3 mb-5">
          {[
            { label: 'Total Forks', value: metrics.totalForks.toLocaleString(), icon: GitFork },
            { label: 'Languages', value: metrics.languageCount.toString() },
            { label: 'Active Repos', value: metrics.recentlyActiveRepos.toString() },
          ].map(({ label, value }) => (
            <div key={label} className="text-center">
              <p className="text-base font-semibold text-space-200">{value}</p>
              <p className="text-xs text-space-500">{label}</p>
            </div>
          ))}
        </div>

        {/* Language breakdown */}
        {topLangs.length > 0 && (
          <div>
            <p className="text-xs font-medium text-space-400 mb-2">Top Languages</p>
            <div className="flex h-2 rounded-full overflow-hidden gap-0.5 mb-2">
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
                    className="transition-all"
                  />
                );
              })}
            </div>
            <div className="flex flex-wrap gap-x-4 gap-y-1">
              {topLangs.map(([lang, count]) => (
                <span key={lang} className="flex items-center gap-1.5 text-xs text-space-300">
                  <span
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ backgroundColor: getLanguageColor(lang) }}
                  />
                  {lang} ({count})
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
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
  return colors[lang] ?? '#8b949e';
}
