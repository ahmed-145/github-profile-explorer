import { NextRequest, NextResponse } from 'next/server';
import {
  fetchGitHubRepo,
  fetchRepoReadme,
  fetchRepoCommits,
  fetchRepoContents,
} from '@/lib/github';

export async function GET(
  req: NextRequest,
  { params }: { params: { owner: string; repo: string } }
) {
  const { searchParams } = new URL(req.url);
  const include = searchParams.get('include')?.split(',') ?? [];

  try {
    const [repoData, readme, commits, contents] = await Promise.all([
      fetchGitHubRepo(params.owner, params.repo),
      include.includes('readme') ? fetchRepoReadme(params.owner, params.repo) : Promise.resolve(null),
      include.includes('commits') ? fetchRepoCommits(params.owner, params.repo) : Promise.resolve(null),
      include.includes('contents') ? fetchRepoContents(params.owner, params.repo) : Promise.resolve(null),
    ]);

    return NextResponse.json({ repo: repoData, readme, commits, contents });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
