import { notFound } from 'next/navigation';
import Navbar from '@/components/Navbar';
import UserCard from '@/components/UserCard';
import AISummary from '@/components/AISummary';
import NotesPanel from '@/components/NotesPanel';
import { fetchGitHubUser, fetchGitHubRepos } from '@/lib/github';
import Link from 'next/link';
import RepoFilters from '@/components/RepoFilters';
import { ArrowLeft } from 'lucide-react';

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
    const message = err instanceof Error ? err.message.toLowerCase() : '';
    if (message.includes('not found')) notFound();
    throw err;
  }

  return (
    <div className="min-h-screen bg-black text-zinc-100">
      <Navbar />
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Link
          href="/"
          className="inline-flex items-center gap-1 text-zinc-400 hover:text-white text-xs mb-4 transition-colors"
        >
          <ArrowLeft size={12} />
          Back to search
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 space-y-4">
            <UserCard user={user} repos={repos} />
            <AISummary user={user} repos={repos} />
            <NotesPanel
              target={user.login}
              targetType="user"
              targetDisplay={`@${user.login}`}
            />
          </div>

          <div className="lg:col-span-2 space-y-4">
            <RepoFilters username={params.username} repos={repos} />
          </div>
        </div>
      </div>
    </div>
  );
}
