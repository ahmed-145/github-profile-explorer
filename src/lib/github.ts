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

function getHeaders() {
  const token = process.env.GITHUB_TOKEN;
  const headers: Record<string, string> = {
    Accept: 'application/vnd.github.v3+json',
    'User-Agent': 'GitExplorer/1.0',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

export async function fetchGitHubUser(username: string): Promise<GitHubUser> {
  const res = await fetch(`${BASE_URL}/users/${username}`, {
    headers: getHeaders(),
    next: { revalidate: 300 },
  });

  if (!res.ok) {
    if (res.status === 404) throw new Error(`User "${username}" not found`);
    if (res.status === 403) throw new Error('GitHub API rate limit exceeded. Please add a GitHub token.');
    throw new Error(`GitHub API error: ${res.status}`);
  }

  const data = await res.json();
  return data;
}

export async function fetchGitHubRepos(username: string): Promise<GitHubRepo[]> {
  const allRepos: GitHubRepo[] = [];
  let page = 1;
  const perPage = 100;

  while (true) {
    const url = `${BASE_URL}/users/${username}/repos?per_page=${perPage}&page=${page}&sort=updated`;
    const res = await fetch(url, {
      headers: getHeaders(),
      next: { revalidate: 300 },
    });

    if (!res.ok) throw new Error(`GitHub API error: ${res.status}`);

    const repos: GitHubRepo[] = await res.json();
    allRepos.push(...repos);

    if (repos.length < perPage) break;
    page++;
    if (page > 10) break;
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
    const headers = { ...getHeaders(), Accept: 'application/vnd.github.raw' };
    const res = await fetch(`${BASE_URL}/repos/${owner}/${repo}/readme`, {
      headers,
      next: { revalidate: 600 },
    });

    if (!res.ok) return 'No README available.';

    const text = await res.text();
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

export function computeUserMetrics(user: GitHubUser, repos: GitHubRepo[]) {
  let totalStars = 0;
  let totalForks = 0;

  for (const repo of repos) {
    totalStars += repo.stargazers_count;
    totalForks += repo.forks_count;
  }

  const languages: Record<string, number> = {};
  for (const repo of repos) {
    if (repo.language) {
      languages[repo.language] = (languages[repo.language] || 0) + 1;
    }
  }

  const langEntries = Object.entries(languages).sort((a, b) => b[1] - a[1]);
  const topLanguage = langEntries[0] ? langEntries[0][0] : 'N/A';

  const now = Date.now();
  const createdAt = new Date(user.created_at).getTime();
  const msPerDay = 1000 * 60 * 60 * 24;
  const accountAgeDays = Math.floor((now - createdAt) / msPerDay);
  const accountAgeYears = Math.floor(accountAgeDays / 365);

  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

  let recentlyActiveRepos = 0;
  for (const repo of repos) {
    if (new Date(repo.pushed_at) > sixMonthsAgo) {
      recentlyActiveRepos++;
    }
  }

  const forkedRepos = repos.filter((r) => r.fork).length;
  const originalRepos = repos.filter((r) => !r.fork).length;
  const avgStarsPerRepo = repos.length > 0 ? Math.round(totalStars / repos.length) : 0;

  return {
    totalStars,
    totalForks,
    topLanguage,
    accountAgeDays,
    accountAgeYears,
    recentlyActiveRepos,
    languageCount: Object.keys(languages).length,
    languages,
    avgStarsPerRepo,
    forkedRepos,
    originalRepos,
  };
}

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
