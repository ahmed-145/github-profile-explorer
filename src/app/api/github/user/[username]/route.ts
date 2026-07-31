import { NextRequest, NextResponse } from 'next/server';
import { fetchGitHubUser } from '@/lib/github';

export async function GET(
  _req: NextRequest,
  { params }: { params: { username: string } }
) {
  try {
    const user = await fetchGitHubUser(params.username);
    return NextResponse.json(user);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    const status = message.includes('not found') ? 404 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
