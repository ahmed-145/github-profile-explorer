import { NextRequest } from 'next/server';
import Groq from 'groq-sdk';

export const runtime = 'nodejs';

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

interface RepoContext {
  owner: string;
  repo: string;
  description: string | null;
  language: string | null;
  stars: number;
  forks: number;
  readme: string;
  commits: Array<{ sha: string; message: string; author: string; date: string }>;
  contents: Array<{ name: string; type: string }>;
}

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function POST(req: NextRequest) {
  try {
    const {
      repoContext,
      messages,
      userMessage,
    }: { repoContext: RepoContext; messages: ChatMessage[]; userMessage: string } = await req.json();

    const fileTree = repoContext.contents
      .map((f) => `${f.type === 'dir' ? '📁' : '📄'} ${f.name}`)
      .join('\n');

    const recentCommits = repoContext.commits
      .slice(0, 10)
      .map((c) => `- [${c.sha.slice(0, 7)}] ${c.message.split('\n')[0]} (by ${c.author}, ${new Date(c.date).toLocaleDateString()})`)
      .join('\n');

    const systemPrompt = `You are an expert code analyst assistant helping users understand the GitHub repository **${repoContext.owner}/${repoContext.repo}**.

You MUST ground ALL your answers in the actual repository data provided below. Do NOT make up information or use prior knowledge about this repo — only use what's in the context. If you don't have enough information to answer accurately, say so clearly.

## Repository Overview
- **Name**: ${repoContext.owner}/${repoContext.repo}
- **Description**: ${repoContext.description ?? 'No description'}
- **Primary Language**: ${repoContext.language ?? 'Unknown'}
- **Stars**: ${repoContext.stars} | **Forks**: ${repoContext.forks}

## README (first 6000 chars)
${repoContext.readme?.slice(0, 6000) ?? 'No README available'}

## Root File Structure
${fileTree || 'No file structure available'}

## Recent Commits (last 10)
${recentCommits || 'No commit data available'}

---
Answer the user's questions about this specific repository based on the above data. Be specific and cite actual files, commits, or README sections when relevant. Use markdown for formatting.`;

    // Build conversation history (last 10 messages for context)
    const historyMessages = messages.slice(-10).map((m) => ({
      role: m.role as 'user' | 'assistant',
      content: m.content,
    }));

    const stream = await groq.chat.completions.create({
      model: 'llama-3.1-8b-instant',
      messages: [
        { role: 'system', content: systemPrompt },
        ...historyMessages,
        { role: 'user', content: userMessage },
      ],
      stream: true,
      max_tokens: 1024,
      temperature: 0.3, // Lower temperature for grounded factual answers
    });

    const encoder = new TextEncoder();
    const readable = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of stream) {
            const delta = chunk.choices[0]?.delta?.content ?? '';
            if (delta) {
              controller.enqueue(encoder.encode(delta));
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
    const message = err instanceof Error ? err.message : 'Chat failed';
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
