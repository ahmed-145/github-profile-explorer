// GitHub API type definitions and client helpers

export interface GitHubUser {
  login: string;
  id: number;
  avatar_url: string;
  html_url: string;
  name: string | null;
  company: string | null;
  blog: string | null;
  location: string | null;
  email: string | null;
  bio: string | null;
  twitter_username: string | null;
  public_repos: number;
  public_gists: number;
  followers: number;
  following: number;
  created_at: string;
  updated_at: string;
}

export interface GitHubRepo {
  id: number;
  name: string;
  full_name: string;
  html_url: string;
  description: string | null;
  fork: boolean;
  stargazers_count: number;
  watchers_count: number;
  forks_count: number;
  language: string | null;
  topics: string[];
  created_at: string;
  updated_at: string;
  pushed_at: string;
  size: number;
  open_issues_count: number;
  license: { name: string } | null;
  default_branch: string;
  archived: boolean;
  visibility: string;
}

export interface GitHubCommit {
  sha: string;
  commit: {
    message: string;
    author: {
      name: string;
      date: string;
    };
  };
  html_url: string;
}

export interface GitHubContent {
  name: string;
  path: string;
  type: 'file' | 'dir';
  size: number;
}

const BASE_URL = 'https://api.github.com';

function getHeaders(): HeadersInit {
  const token = process.env.GITHUB_TOKEN;
  return {
    Accept: 'application/vnd.github.v3+json',
    'User-Agent': 'GitExplorer/1.0',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

export async function fetchGitHubUser(username: string): Promise<GitHubUser> {
  const res = await fetch(`${BASE_URL}/users/${username}`, {
    headers: getHeaders(),
    next: { revalidate: 300 }, // Cache for 5 min
  });

  if (!res.ok) {
    if (res.status === 404) throw new Error(`User "${username}" not found`);
    if (res.status === 403) throw new Error('GitHub API rate limit exceeded. Please add a GitHub token.');
    throw new Error(`GitHub API error: ${res.status}`);
  }

  return res.json();
}

export async function fetchGitHubRepos(username: string): Promise<GitHubRepo[]> {
  const allRepos: GitHubRepo[] = [];
  let page = 1;
  const perPage = 100;

  while (true) {
    const res = await fetch(
      `${BASE_URL}/users/${username}/repos?per_page=${perPage}&page=${page}&sort=updated`,
      {
        headers: getHeaders(),
        next: { revalidate: 300 },
      }
    );

    if (!res.ok) throw new Error(`GitHub API error: ${res.status}`);

    const repos: GitHubRepo[] = await res.json();
    allRepos.push(...repos);

    if (repos.length < perPage) break;
    page++;
    if (page > 10) break; // Safety cap at 1000 repos
  }

  return allRepos;
}

export async function fetchGitHubRepo(owner: string, repo: string): Promise<GitHubRepo> {
  const res = await fetch(`${BASE_URL}/repos/${owner}/${repo}`, {
    headers: getHeaders(),
    next: { revalidate: 300 },
  });

  if (!res.ok) throw new Error(`Repository not found: ${owner}/${repo}`);
  return res.json();
}

export async function fetchRepoReadme(owner: string, repo: string): Promise<string> {
  try {
    const res = await fetch(`${BASE_URL}/repos/${owner}/${repo}/readme`, {
      headers: { ...getHeaders(), Accept: 'application/vnd.github.raw' },
      next: { revalidate: 600 },
    });

    if (!res.ok) return 'No README available.';
    const text = await res.text();
    // Limit to 8000 chars to keep within AI context limits
    return text.slice(0, 8000);
  } catch {
    return 'No README available.';
  }
}

export async function fetchRepoCommits(owner: string, repo: string): Promise<GitHubCommit[]> {
  try {
    const res = await fetch(`${BASE_URL}/repos/${owner}/${repo}/commits?per_page=20`, {
      headers: getHeaders(),
      next: { revalidate: 300 },
    });

    if (!res.ok) return [];
    return res.json();
  } catch {
    return [];
  }
}

export async function fetchRepoContents(owner: string, repo: string): Promise<GitHubContent[]> {
  try {
    const res = await fetch(`${BASE_URL}/repos/${owner}/${repo}/contents`, {
      headers: getHeaders(),
      next: { revalidate: 600 },
    });

    if (!res.ok) return [];
    return res.json();
  } catch {
    return [];
  }
}

// Compute derived metrics for comparison
export function computeUserMetrics(user: GitHubUser, repos: GitHubRepo[]) {
  const totalStars = repos.reduce((sum, r) => sum + r.stargazers_count, 0);
  const totalForks = repos.reduce((sum, r) => sum + r.forks_count, 0);
  const languages = repos
    .filter((r) => r.language)
    .reduce((acc, r) => {
      const lang = r.language!;
      acc[lang] = (acc[lang] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

  const topLanguage = Object.entries(languages).sort((a, b) => b[1] - a[1])[0]?.[0] ?? 'N/A';

  const accountAge = Math.floor(
    (Date.now() - new Date(user.created_at).getTime()) / (1000 * 60 * 60 * 24 * 365)
  );

  const recentlyActiveRepos = repos.filter((r) => {
    const lastPush = new Date(r.pushed_at);
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    return lastPush > sixMonthsAgo;
  }).length;

  return {
    totalStars,
    totalForks,
    topLanguage,
    accountAgeDays: Math.floor(
      (Date.now() - new Date(user.created_at).getTime()) / (1000 * 60 * 60 * 24)
    ),
    accountAgeYears: accountAge,
    recentlyActiveRepos,
    languageCount: Object.keys(languages).length,
    languages,
    avgStarsPerRepo: repos.length > 0 ? Math.round(totalStars / repos.length) : 0,
    forkedRepos: repos.filter((r) => r.fork).length,
    originalRepos: repos.filter((r) => !r.fork).length,
  };
}

// Language color map
export const LANGUAGE_COLORS: Record<string, string> = {
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
