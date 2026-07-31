import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import Navbar from '@/components/Navbar';
import UserCard from '@/components/UserCard';
import RepoCard from '@/components/RepoCard';
import AISummary from '@/components/AISummary';
import NotesPanel from '@/components/NotesPanel';
import { fetchGitHubUser, fetchGitHubRepos, GitHubRepo } from '@/lib/github';
import {
  Search,
  SortAsc,
  Filter,
  Star,
  GitFork,
  Clock,
  ArrowLeft,
} from 'lucide-react';
import Link from 'next/link';
import RepoFilters from '@/components/RepoFilters';

interface PageProps {
  params: { username: string };
}

export async function generateMetadata({ params }: PageProps) {
  try {
    const user = await fetchGitHubUser(params.username);
    return {
      title: `${user.name ?? user.login} (@${user.login}) — GitExplorer`,
      description: user.bio ?? `GitHub profile of ${user.login}`,
    };
  } catch {
    return { title: 'User Not Found — GitExplorer' };
  }
}

export default async function UserPage({ params }: PageProps) {
  let user, repos;

  try {
    [user, repos] = await Promise.all([
      fetchGitHubUser(params.username),
      fetchGitHubRepos(params.username),
    ]);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : '';
    if (message.includes('not found')) notFound();
    throw err;
  }

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back link */}
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-space-400 hover:text-space-200 text-sm mb-6 transition-colors"
        >
          <ArrowLeft size={14} />
          Back to search
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left column */}
          <div className="lg:col-span-1 space-y-5">
            <UserCard user={user} repos={repos} />
            <AISummary user={user} repos={repos} />
            <NotesPanel
              target={user.login}
              targetType="user"
              targetDisplay={`@${user.login}`}
            />
          </div>

          {/* Right column — repos */}
          <div className="lg:col-span-2 space-y-5">
            <RepoFilters username={params.username} repos={repos} />
          </div>
        </div>
      </div>
    </div>
  );
}
