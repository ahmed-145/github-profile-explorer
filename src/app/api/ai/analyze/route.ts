import { NextRequest } from 'next/server';
import Groq from 'groq-sdk';
import { GitHubUser, GitHubRepo, computeUserMetrics } from '@/lib/github';

export async function POST(req: NextRequest) {
  try {
    if (!process.env.GROQ_API_KEY) {
      return new Response(JSON.stringify({ error: 'GROQ_API_KEY environment variable is not configured.' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

    const body = await req.json();
    const user: GitHubUser = body.user;
    const repos: GitHubRepo[] = body.repos;

    const metrics = computeUserMetrics(user, repos);

    const sortedRepos = [...repos].sort((a, b) => b.stargazers_count - a.stargazers_count);
    const topRepos = sortedRepos.slice(0, 5);

    const langEntries = Object.entries(metrics.languages).sort((a, b) => b[1] - a[1]);
    const topFiveLangs = langEntries.slice(0, 5);
    const topLanguages = topFiveLangs.map(([lang, count]) => `${lang} (${count} repos)`).join(', ');

    const systemPrompt = `You are an expert developer analyst. Analyze GitHub profiles and provide insightful, engaging, and accurate developer profiles. Be specific, use the actual data provided, and avoid generic statements. Use markdown formatting with headers and bullet points.`;

    const repoList = topRepos
      .map((r) => `- **${r.name}** (⭐${r.stargazers_count}, 🍴${r.forks_count}) — ${r.description ?? 'No description'} [${r.language ?? 'Unknown'}]`)
      .join('\n');

    const userPrompt = `Analyze this GitHub developer profile and provide a comprehensive summary:

**Developer**: ${user.name ?? user.login} (@${user.login})
**Bio**: ${user.bio ?? 'Not provided'}
**Location**: ${user.location ?? 'Not specified'}
**Account Age**: ${metrics.accountAgeYears} years (${metrics.accountAgeDays} days)
**Followers**: ${user.followers} | **Following**: ${user.following}
**Public Repos**: ${user.public_repos} (${metrics.originalRepos} original, ${metrics.forkedRepos} forked)
**Total Stars Earned**: ${metrics.totalStars}
**Total Forks**: ${metrics.totalForks}
**Top Languages**: ${topLanguages || 'N/A'}
**Recently Active Repos** (last 6 months): ${metrics.recentlyActiveRepos}
**Average Stars per Repo**: ${metrics.avgStarsPerRepo}

**Top Repositories**:
${repoList}

Please provide:
## 🎯 Developer Archetype
What type of developer is this? (e.g., Open Source Champion, Polyglot Engineer, Specialist, etc.)

## 💡 Key Strengths
Their main technical strengths based on the data.

## 🔥 Activity & Impact
Assessment of their contribution patterns and community impact.

## 🚀 Notable Projects
Highlights from their top repositories.

## 📈 Growth Trajectory
What the data suggests about their growth and trajectory.

## 💼 Ideal Fit
What types of projects or companies they would be a great fit for.

Keep it insightful, data-driven, and under 600 words.`;

    const stream = await groq.chat.completions.create({
      model: 'llama-3.1-8b-instant',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      stream: true,
      max_tokens: 1024,
      temperature: 0.7,
    });

    const encoder = new TextEncoder();

    const readable = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of stream) {
            const text = chunk.choices[0]?.delta?.content ?? '';
            if (text) {
              controller.enqueue(encoder.encode(text));
            }
          }
        } finally {
          controller.close();
        }
      },
    });

    return new Response(readable, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Transfer-Encoding': 'chunked',
        'Cache-Control': 'no-cache',
      },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'AI analysis failed';
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
