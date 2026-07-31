'use client';

import { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Navbar from '@/components/Navbar';
import UserCard from '@/components/UserCard';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  Radar,
  Legend,
} from 'recharts';
import { GitHubUser, GitHubRepo, computeUserMetrics } from '@/lib/github';
import {
  Users,
  Star,
  GitFork,
  BookOpen,
  Calendar,
  Zap,
  Search,
  Loader2,
  Trophy,
} from 'lucide-react';

interface CompareState {
  user: GitHubUser;
  repos: GitHubRepo[];
}

export default function ComparePage() {
  const searchParams = useSearchParams();

  const [user1Input, setUser1Input] = useState(searchParams.get('user1') ?? '');
  const [user2Input, setUser2Input] = useState(searchParams.get('user2') ?? '');
  const [data1, setData1] = useState<CompareState | null>(null);
  const [data2, setData2] = useState<CompareState | null>(null);
  const [loading1, setLoading1] = useState(false);
  const [loading2, setLoading2] = useState(false);
  const [error1, setError1] = useState<string | null>(null);
  const [error2, setError2] = useState<string | null>(null);

  const fetchUser = async (
    username: string,
    setData: (d: CompareState | null) => void,
    setLoading: (v: boolean) => void,
    setError: (e: string | null) => void
  ) => {
    if (!username.trim()) return;
    setLoading(true);
    setError(null);
    setData(null);

    try {
      const [userRes, reposRes] = await Promise.all([
        fetch(`/api/github/user/${username.trim()}`),
        fetch(`/api/github/repos/${username.trim()}`),
      ]);

      if (!userRes.ok) {
        const err = await userRes.json();
        throw new Error(err.error ?? 'User not found');
      }

      const [user, repos] = await Promise.all([userRes.json(), reposRes.json()]);
      setData({ user, repos });
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to fetch user');
    } finally {
      setLoading(false);
    }
  };

  const handleCompare = () => {
    fetchUser(user1Input, setData1, setLoading1, setError1);
    fetchUser(user2Input, setData2, setLoading2, setError2);
  };

  const ready = data1 && data2;
  const metrics1 = data1 ? computeUserMetrics(data1.user, data1.repos) : null;
  const metrics2 = data2 ? computeUserMetrics(data2.user, data2.repos) : null;

  const barData = ready && metrics1 && metrics2 ? [
    { metric: 'Followers', [data1.user.login]: data1.user.followers, [data2.user.login]: data2.user.followers },
    { metric: 'Repos', [data1.user.login]: data1.user.public_repos, [data2.user.login]: data2.user.public_repos },
    { metric: 'Stars', [data1.user.login]: metrics1.totalStars, [data2.user.login]: metrics2.totalStars },
    { metric: 'Forks', [data1.user.login]: metrics1.totalForks, [data2.user.login]: metrics2.totalForks },
    { metric: 'Active Repos', [data1.user.login]: metrics1.recentlyActiveRepos, [data2.user.login]: metrics2.recentlyActiveRepos },
  ] : [];

  const normalize = (val: number, max: number) => max === 0 ? 0 : Math.round((val / max) * 100);

  const radarData = ready && metrics1 && metrics2 ? [
    {
      subject: 'Followers',
      [data1.user.login]: normalize(data1.user.followers, Math.max(data1.user.followers, data2.user.followers)),
      [data2.user.login]: normalize(data2.user.followers, Math.max(data1.user.followers, data2.user.followers)),
    },
    {
      subject: 'Repos',
      [data1.user.login]: normalize(data1.user.public_repos, Math.max(data1.user.public_repos, data2.user.public_repos)),
      [data2.user.login]: normalize(data2.user.public_repos, Math.max(data1.user.public_repos, data2.user.public_repos)),
    },
    {
      subject: 'Stars',
      [data1.user.login]: normalize(metrics1.totalStars, Math.max(metrics1.totalStars, metrics2.totalStars)),
      [data2.user.login]: normalize(metrics2.totalStars, Math.max(metrics1.totalStars, metrics2.totalStars)),
    },
    {
      subject: 'Forks',
      [data1.user.login]: normalize(metrics1.totalForks, Math.max(metrics1.totalForks, metrics2.totalForks)),
      [data2.user.login]: normalize(metrics2.totalForks, Math.max(metrics1.totalForks, metrics2.totalForks)),
    },
    {
      subject: 'Activity',
      [data1.user.login]: normalize(metrics1.recentlyActiveRepos, Math.max(metrics1.recentlyActiveRepos, metrics2.recentlyActiveRepos)),
      [data2.user.login]: normalize(metrics2.recentlyActiveRepos, Math.max(metrics1.recentlyActiveRepos, metrics2.recentlyActiveRepos)),
    },
    {
      subject: 'Languages',
      [data1.user.login]: normalize(metrics1.languageCount, Math.max(metrics1.languageCount, metrics2.languageCount)),
      [data2.user.login]: normalize(metrics2.languageCount, Math.max(metrics1.languageCount, metrics2.languageCount)),
    },
  ] : [];

  type MetricRow = {
    label: string;
    icon: React.ReactNode;
    v1: string | number;
    v2: string | number;
    raw1: number;
    raw2: number;
  };

  const comparisonRows: MetricRow[] = ready && metrics1 && metrics2 ? [
    { label: 'Followers', icon: <Users size={13} />, v1: data1.user.followers.toLocaleString(), v2: data2.user.followers.toLocaleString(), raw1: data1.user.followers, raw2: data2.user.followers },
    { label: 'Public Repos', icon: <BookOpen size={13} />, v1: data1.user.public_repos, v2: data2.user.public_repos, raw1: data1.user.public_repos, raw2: data2.user.public_repos },
    { label: 'Total Stars', icon: <Star size={13} />, v1: metrics1.totalStars.toLocaleString(), v2: metrics2.totalStars.toLocaleString(), raw1: metrics1.totalStars, raw2: metrics2.totalStars },
    { label: 'Total Forks', icon: <GitFork size={13} />, v1: metrics1.totalForks.toLocaleString(), v2: metrics2.totalForks.toLocaleString(), raw1: metrics1.totalForks, raw2: metrics2.totalForks },
    { label: 'Languages', icon: <Zap size={13} />, v1: metrics1.languageCount, v2: metrics2.languageCount, raw1: metrics1.languageCount, raw2: metrics2.languageCount },
    { label: 'Active Repos (6mo)', icon: <Calendar size={13} />, v1: metrics1.recentlyActiveRepos, v2: metrics2.recentlyActiveRepos, raw1: metrics1.recentlyActiveRepos, raw2: metrics2.recentlyActiveRepos },
    { label: 'Avg Stars/Repo', icon: <Star size={13} />, v1: metrics1.avgStarsPerRepo, v2: metrics2.avgStarsPerRepo, raw1: metrics1.avgStarsPerRepo, raw2: metrics2.avgStarsPerRepo },
    { label: 'Top Language', icon: <Zap size={13} />, v1: metrics1.topLanguage, v2: metrics2.topLanguage, raw1: 0, raw2: 0 },
  ] : [];

  const WHITE = '#ffffff';
  const ZINC = '#71717a';

  return (
    <div className="min-h-screen bg-black text-zinc-100">
      <Navbar />
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-xl font-bold text-white mb-1">Compare Profiles</h1>
        <p className="text-zinc-400 text-xs mb-6">Compare metrics for any two GitHub developers.</p>

        <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4 mb-6">
          <div className="flex flex-col sm:flex-row items-center gap-2">
            <div className="flex-1 relative w-full">
              <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
              <input
                id="compare-user1-input"
                value={user1Input}
                onChange={(e) => setUser1Input(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleCompare()}
                placeholder="User 1 username"
                className="bg-zinc-950 border border-zinc-800 rounded text-xs pl-8 pr-3 py-2 text-white outline-none focus:border-zinc-700 w-full"
              />
            </div>
            <span className="text-zinc-500 font-bold text-xs">VS</span>
            <div className="flex-1 relative w-full">
              <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
              <input
                id="compare-user2-input"
                value={user2Input}
                onChange={(e) => setUser2Input(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleCompare()}
                placeholder="User 2 username"
                className="bg-zinc-950 border border-zinc-800 rounded text-xs pl-8 pr-3 py-2 text-white outline-none focus:border-zinc-700 w-full"
              />
            </div>
            <button
              onClick={handleCompare}
              disabled={!user1Input.trim() || !user2Input.trim() || loading1 || loading2}
              id="compare-btn"
              className="bg-white text-black text-xs font-medium px-4 py-2 rounded hover:bg-zinc-200 transition-colors disabled:opacity-40 shrink-0 w-full sm:w-auto"
            >
              {loading1 || loading2 ? <Loader2 size={14} className="animate-spin" /> : 'Compare'}
            </button>
          </div>
          {(error1 || error2) && (
            <div className="mt-2 text-red-400 text-xs flex gap-4">
              {error1 && <span>User 1: {error1}</span>}
              {error2 && <span>User 2: {error2}</span>}
            </div>
          )}
        </div>

        {ready && metrics1 && metrics2 && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <UserCard user={data1!.user} repos={data1!.repos} />
              <UserCard user={data2!.user} repos={data2!.repos} />
            </div>

            <div className="bg-zinc-900 border border-zinc-800 rounded-lg overflow-hidden">
              <div className="px-4 py-3 border-b border-zinc-800 flex items-center gap-2">
                <Trophy size={14} className="text-zinc-400" />
                <h2 className="font-medium text-white text-sm">Metrics Breakdown</h2>
              </div>
              <div className="divide-y divide-zinc-800 text-xs">
                <div className="grid grid-cols-3 px-4 py-2 font-medium text-zinc-500 bg-zinc-950">
                  <span>Metric</span>
                  <span className="text-center text-white">{data1.user.login}</span>
                  <span className="text-center text-white">{data2.user.login}</span>
                </div>
                {comparisonRows.map(({ label, icon, v1, v2, raw1, raw2 }) => (
                  <div key={label} className="grid grid-cols-3 px-4 py-2.5">
                    <span className="flex items-center gap-1.5 text-zinc-400">
                      {icon}
                      {label}
                    </span>
                    <span className={`text-center font-medium ${raw1 > raw2 ? 'text-white font-semibold' : 'text-zinc-400'}`}>
                      {v1}
                    </span>
                    <span className={`text-center font-medium ${raw2 > raw1 ? 'text-white font-semibold' : 'text-zinc-400'}`}>
                      {v2}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4">
                <h3 className="font-medium text-white text-xs mb-4">Metrics Comparison</h3>
                <ResponsiveContainer width="100%" height={240}>
                  <BarChart data={barData} margin={{ top: 5, right: 5, bottom: 5, left: -20 }}>
                    <XAxis dataKey="metric" tick={{ fill: '#71717a', fontSize: 10 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: '#71717a', fontSize: 10 }} axisLine={false} tickLine={false} />
                    <Tooltip contentStyle={{ backgroundColor: '#18181b', border: '1px solid #27272a', borderRadius: 4, color: '#fff', fontSize: 11 }} />
                    <Legend wrapperStyle={{ fontSize: 11, color: '#a1a1aa' }} />
                    <Bar dataKey={data1.user.login} fill={WHITE} radius={[2, 2, 0, 0]} />
                    <Bar dataKey={data2.user.login} fill={ZINC} radius={[2, 2, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4">
                <h3 className="font-medium text-white text-xs mb-4">Profile Radar</h3>
                <ResponsiveContainer width="100%" height={240}>
                  <RadarChart data={radarData}>
                    <PolarGrid stroke="#27272a" />
                    <PolarAngleAxis dataKey="subject" tick={{ fill: '#71717a', fontSize: 10 }} />
                    <Radar name={data1.user.login} dataKey={data1.user.login} stroke={WHITE} fill={WHITE} fillOpacity={0.15} />
                    <Radar name={data2.user.login} dataKey={data2.user.login} stroke={ZINC} fill={ZINC} fillOpacity={0.15} />
                    <Legend wrapperStyle={{ fontSize: 11, color: '#a1a1aa' }} />
                    <Tooltip contentStyle={{ backgroundColor: '#18181b', border: '1px solid #27272a', borderRadius: 4, color: '#fff', fontSize: 11 }} />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
