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
    <div className="min-h-screen bg-black text-zinc-100">
      <Navbar />
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center gap-2 text-xs mb-4">
          <Link
            href={`/user/${params.owner}`}
            className="text-zinc-400 hover:text-white transition-colors flex items-center gap-1"
          >
            <ArrowLeft size={12} />
            {params.owner}
          </Link>
          <span className="text-zinc-600">/</span>
          <span className="text-white font-medium">{params.repo}</span>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-5 mb-6">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
            <div className="flex-1">
              <h1 className="text-lg font-bold text-white mb-1">
                <span className="text-zinc-500">{params.owner}/</span>
                {repo.name}
              </h1>
              {repo.description && (
                <p className="text-zinc-400 text-xs leading-relaxed mb-3">{repo.description}</p>
              )}

              {repo.topics.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-3">
                  {repo.topics.map((topic) => (
                    <span key={topic} className="px-2 py-0.5 rounded bg-zinc-800 text-zinc-400 text-[11px] flex items-center gap-1">
                      <Tag size={10} />
                      {topic}
                    </span>
                  ))}
                </div>
              )}

              <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-zinc-400">
                {repo.language && (
                  <span className="flex items-center gap-1">
                    <Code2 size={12} />
                    {repo.language}
                  </span>
                )}
                {repo.license && (
                  <span className="flex items-center gap-1">
                    <Scale size={12} />
                    {repo.license.name}
                  </span>
                )}
                <span className="flex items-center gap-1">
                  <Clock size={12} />
                  Updated {formatDistanceToNow(new Date(repo.pushed_at), { addSuffix: true })}
                </span>
                <span className="flex items-center gap-1">
                  <Clock size={12} />
                  Created {format(new Date(repo.created_at), 'MMM d, yyyy')}
                </span>
              </div>
            </div>

            <a
              href={repo.html_url}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-zinc-800 border border-zinc-700 text-zinc-300 text-xs px-3 py-1.5 rounded hover:text-white transition-colors flex items-center gap-1 shrink-0"
            >
              <ExternalLink size={12} />
              View on GitHub
            </a>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-4 pt-4 border-t border-zinc-800/80">
            {[
              { icon: Star, label: 'Stars', value: repo.stargazers_count.toLocaleString() },
              { icon: GitFork, label: 'Forks', value: repo.forks_count.toLocaleString() },
              { icon: Eye, label: 'Watchers', value: repo.watchers_count.toLocaleString() },
              { icon: AlertCircle, label: 'Issues', value: repo.open_issues_count.toLocaleString() },
            ].map(({ icon: Icon, label, value }) => (
              <div key={label} className="bg-zinc-950 border border-zinc-800 rounded p-2.5 text-center">
                <Icon size={14} className="mx-auto text-zinc-500 mb-1" />
                <span className="text-sm font-semibold text-white block">{value}</span>
                <span className="text-[11px] text-zinc-500">{label}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <RepoChat owner={params.owner} repo={params.repo} repoContext={repoContext} />
            <NotesPanel
              target={`${params.owner}/${params.repo}`}
              targetType="repo"
              targetDisplay={`${params.owner}/${params.repo}`}
            />
          </div>

          <div className="lg:col-span-1 space-y-4">
            <div className="bg-zinc-900 border border-zinc-800 rounded-lg overflow-hidden">
              <div className="px-3 py-2 border-b border-zinc-800 flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs text-white font-medium">
                  <Folder size={13} className="text-zinc-400" />
                  <span>File Structure</span>
                </div>
                <span className="text-[11px] text-zinc-500">{contents.length} items</span>
              </div>
              <div className="p-2 max-h-64 overflow-y-auto space-y-0.5 text-xs">
                {dirs.map((f) => (
                  <div key={f.name} className="flex items-center gap-1.5 px-2 py-1 rounded text-zinc-300">
                    <Folder size={12} className="text-zinc-500 shrink-0" />
                    <span className="truncate">{f.name}</span>
                  </div>
                ))}
                {files.map((f) => (
                  <div key={f.name} className="flex items-center gap-1.5 px-2 py-1 rounded text-zinc-400">
                    <FileText size={12} className="text-zinc-600 shrink-0" />
                    <span className="truncate">{f.name}</span>
                  </div>
                ))}
              </div>
            </div>

            {commits.length > 0 && (
              <div className="bg-zinc-900 border border-zinc-800 rounded-lg overflow-hidden">
                <div className="px-3 py-2 border-b border-zinc-800 flex items-center gap-1.5 text-xs text-white font-medium">
                  <GitCommit size={13} className="text-zinc-400" />
                  <span>Recent Commits</span>
                </div>
                <div className="divide-y divide-zinc-800 max-h-72 overflow-y-auto">
                  {commits.slice(0, 8).map((c) => (
                    <a
                      key={c.sha}
                      href={c.html_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex flex-col gap-0.5 px-3 py-2 hover:bg-zinc-800/50 transition-colors text-xs"
                    >
                      <p className="text-zinc-300 line-clamp-1">
                        {c.commit.message.split('\n')[0]}
                      </p>
                      <div className="flex items-center gap-2 text-[11px] text-zinc-500 font-mono">
                        <span>{c.sha.slice(0, 7)}</span>
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
