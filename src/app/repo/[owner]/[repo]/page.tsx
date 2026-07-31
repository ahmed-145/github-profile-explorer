import { notFound } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import RepoChat from '@/components/RepoChat';
import NotesPanel from '@/components/NotesPanel';
import {
  fetchGitHubRepo,
  fetchRepoReadme,
  fetchRepoCommits,
  fetchRepoContents,
} from '@/lib/github';
import {
  Star,
  GitFork,
  Eye,
  AlertCircle,
  Code2,
  ArrowLeft,
  ExternalLink,
  Clock,
  GitCommit,
  FileText,
  Folder,
  Tag,
  Scale,
} from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';

interface PageProps {
  params: { owner: string; repo: string };
}

export async function generateMetadata({ params }: PageProps) {
  try {
    const repo = await fetchGitHubRepo(params.owner, params.repo);
    return {
      title: `${params.owner}/${repo.name} — GitExplorer`,
      description: repo.description ?? `Repository ${params.owner}/${repo.name} on GitHub`,
    };
  } catch {
    return { title: 'Repository — GitExplorer' };
  }
}

export default async function RepoPage({ params }: PageProps) {
  let repo, readme, commits, contents;

  try {
    [repo, readme, commits, contents] = await Promise.all([
      fetchGitHubRepo(params.owner, params.repo),
      fetchRepoReadme(params.owner, params.repo),
      fetchRepoCommits(params.owner, params.repo),
      fetchRepoContents(params.owner, params.repo),
    ]);
  } catch {
    notFound();
  }

  const repoContext = {
    description: repo.description,
    language: repo.language,
    stars: repo.stargazers_count,
    forks: repo.forks_count,
    readme,
    commits: commits.map((c) => ({
      sha: c.sha,
      message: c.commit.message,
      author: c.commit.author.name,
      date: c.commit.author.date,
    })),
    contents: contents.map((f) => ({ name: f.name, type: f.type })),
  };

  const dirs = contents.filter((c) => c.type === 'dir');
  const files = contents.filter((c) => c.type === 'file');

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm mb-6">
          <Link
            href={`/user/${params.owner}`}
            className="text-space-400 hover:text-accent-purple transition-colors flex items-center gap-1"
          >
            <ArrowLeft size={14} />
            {params.owner}
          </Link>
          <span className="text-space-600">/</span>
          <span className="text-space-200 font-medium">{params.repo}</span>
        </div>

        {/* Header */}
        <div className="glass rounded-2xl p-6 mb-6">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
            <div className="flex-1">
              <h1 className="text-xl font-bold text-space-100 mb-1">
                <span className="text-space-400">{params.owner}/</span>
                {repo.name}
              </h1>
              {repo.description && (
                <p className="text-space-300 text-sm leading-relaxed mb-3">{repo.description}</p>
              )}

              {/* Topics */}
              {repo.topics.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mb-3">
                  {repo.topics.map((topic) => (
                    <span key={topic} className="tag text-xs flex items-center gap-1">
                      <Tag size={10} />
                      {topic}
                    </span>
                  ))}
                </div>
              )}

              {/* Meta */}
              <div className="flex flex-wrap gap-x-4 gap-y-1.5 text-sm text-space-300">
                {repo.language && (
                  <span className="flex items-center gap-1.5">
                    <Code2 size={13} className="text-space-400" />
                    {repo.language}
                  </span>
                )}
                {repo.license && (
                  <span className="flex items-center gap-1.5">
                    <Scale size={13} className="text-space-400" />
                    {repo.license.name}
                  </span>
                )}
                <span className="flex items-center gap-1.5">
                  <Clock size={13} className="text-space-400" />
                  Updated {formatDistanceToNow(new Date(repo.pushed_at), { addSuffix: true })}
                </span>
                <span className="flex items-center gap-1.5">
                  <Clock size={13} className="text-space-400" />
                  Created {format(new Date(repo.created_at), 'MMM d, yyyy')}
                </span>
              </div>
            </div>

            <div className="flex flex-col gap-2 shrink-0">
              <a
                href={repo.html_url}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-secondary text-sm flex items-center gap-2"
              >
                <ExternalLink size={14} />
                View on GitHub
              </a>
            </div>
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5 pt-5 border-t border-space-700/50">
            {[
              { icon: Star, label: 'Stars', value: repo.stargazers_count.toLocaleString(), color: 'text-yellow-400' },
              { icon: GitFork, label: 'Forks', value: repo.forks_count.toLocaleString(), color: 'text-accent-blue' },
              { icon: Eye, label: 'Watchers', value: repo.watchers_count.toLocaleString(), color: 'text-accent-cyan' },
              { icon: AlertCircle, label: 'Issues', value: repo.open_issues_count.toLocaleString(), color: 'text-accent-orange' },
            ].map(({ icon: Icon, label, value, color }) => (
              <div key={label} className="stat-card">
                <Icon size={16} className={color} />
                <span className="text-lg font-bold text-space-100">{value}</span>
                <span className="text-xs text-space-400">{label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Main grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: AI Chat + Notes */}
          <div className="lg:col-span-2 space-y-6">
            <RepoChat owner={params.owner} repo={params.repo} repoContext={repoContext} />
            <NotesPanel
              target={`${params.owner}/${params.repo}`}
              targetType="repo"
              targetDisplay={`${params.owner}/${params.repo}`}
            />
          </div>

          {/* Right: File tree + Commits */}
          <div className="lg:col-span-1 space-y-5">
            {/* File structure */}
            <div className="glass rounded-2xl overflow-hidden">
              <div className="px-4 py-3 border-b border-space-700/50 flex items-center gap-2">
                <Folder size={14} className="text-accent-yellow" />
                <h3 className="text-sm font-semibold text-space-100">File Structure</h3>
                <span className="ml-auto text-xs text-space-500">{contents.length} items</span>
              </div>
              <div className="p-3 max-h-72 overflow-y-auto space-y-0.5">
                {dirs.map((f) => (
                  <div key={f.name} className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-space-700/30 transition-colors">
                    <Folder size={13} className="text-accent-blue shrink-0" />
                    <span className="text-sm text-space-300 truncate">{f.name}</span>
                  </div>
                ))}
                {files.map((f) => (
                  <div key={f.name} className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-space-700/30 transition-colors">
                    <FileText size={13} className="text-space-400 shrink-0" />
                    <span className="text-sm text-space-300 truncate">{f.name}</span>
                  </div>
                ))}
                {contents.length === 0 && (
                  <p className="text-space-500 text-xs text-center py-4">No file data available</p>
                )}
              </div>
            </div>

            {/* Recent commits */}
            {commits.length > 0 && (
              <div className="glass rounded-2xl overflow-hidden">
                <div className="px-4 py-3 border-b border-space-700/50 flex items-center gap-2">
                  <GitCommit size={14} className="text-accent-green" />
                  <h3 className="text-sm font-semibold text-space-100">Recent Commits</h3>
                </div>
                <div className="divide-y divide-space-700/30 max-h-80 overflow-y-auto">
                  {commits.slice(0, 10).map((c) => (
                    <a
                      key={c.sha}
                      href={c.html_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex flex-col gap-1 px-4 py-3 hover:bg-space-700/20 transition-colors group"
                    >
                      <p className="text-xs text-space-200 line-clamp-2 leading-relaxed group-hover:text-accent-blue transition-colors">
                        {c.commit.message.split('\n')[0]}
                      </p>
                      <div className="flex items-center gap-2 text-xs text-space-500">
                        <span className="font-mono text-accent-cyan/70">{c.sha.slice(0, 7)}</span>
                        <span>·</span>
                        <span>{c.commit.author.name}</span>
                        <span>·</span>
                        <span>{formatDistanceToNow(new Date(c.commit.author.date), { addSuffix: true })}</span>
                      </div>
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
