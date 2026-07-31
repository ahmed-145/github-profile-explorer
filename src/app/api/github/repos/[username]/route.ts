import { NextRequest, NextResponse } from 'next/server';
import { fetchGitHubRepos } from '@/lib/github';

export async function GET(
  _req: NextRequest,
  { params }: { params: { username: string } }
) {
  try {
    const repos = await fetchGitHubRepos(params.username);
    return NextResponse.json(repos);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
