'use client';

import { useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
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
  ArrowRight,
} from 'lucide-react';

interface CompareState {
  user: GitHubUser;
  repos: GitHubRepo[];
}

export default function ComparePage() {
  const searchParams = useSearchParams();
  const router = useRouter();

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

  // Build chart data
  const barData = ready && metrics1 && metrics2 ? [
    { metric: 'Followers', [data1.user.login]: data1.user.followers, [data2.user.login]: data2.user.followers },
    { metric: 'Repos', [data1.user.login]: data1.user.public_repos, [data2.user.login]: data2.user.public_repos },
    { metric: 'Stars', [data1.user.login]: metrics1.totalStars, [data2.user.login]: metrics2.totalStars },
    { metric: 'Forks', [data1.user.login]: metrics1.totalForks, [data2.user.login]: metrics2.totalForks },
    { metric: 'Active Repos', [data1.user.login]: metrics1.recentlyActiveRepos, [data2.user.login]: metrics2.recentlyActiveRepos },
  ] : [];

  // Normalize values 0-100 for radar
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
    { label: 'Followers', icon: <Users size={14} />, v1: data1.user.followers.toLocaleString(), v2: data2.user.followers.toLocaleString(), raw1: data1.user.followers, raw2: data2.user.followers },
    { label: 'Public Repos', icon: <BookOpen size={14} />, v1: data1.user.public_repos, v2: data2.user.public_repos, raw1: data1.user.public_repos, raw2: data2.user.public_repos },
    { label: 'Total Stars', icon: <Star size={14} />, v1: metrics1.totalStars.toLocaleString(), v2: metrics2.totalStars.toLocaleString(), raw1: metrics1.totalStars, raw2: metrics2.totalStars },
    { label: 'Total Forks', icon: <GitFork size={14} />, v1: metrics1.totalForks.toLocaleString(), v2: metrics2.totalForks.toLocaleString(), raw1: metrics1.totalForks, raw2: metrics2.totalForks },
    { label: 'Languages', icon: <Zap size={14} />, v1: metrics1.languageCount, v2: metrics2.languageCount, raw1: metrics1.languageCount, raw2: metrics2.languageCount },
    { label: 'Active Repos (6mo)', icon: <Calendar size={14} />, v1: metrics1.recentlyActiveRepos, v2: metrics2.recentlyActiveRepos, raw1: metrics1.recentlyActiveRepos, raw2: metrics2.recentlyActiveRepos },
    { label: 'Avg Stars/Repo', icon: <Star size={14} />, v1: metrics1.avgStarsPerRepo, v2: metrics2.avgStarsPerRepo, raw1: metrics1.avgStarsPerRepo, raw2: metrics2.avgStarsPerRepo },
    { label: 'Top Language', icon: <Zap size={14} />, v1: metrics1.topLanguage, v2: metrics2.topLanguage, raw1: 0, raw2: 0 },
  ] : [];

  const PURPLE = '#a78bfa';
  const BLUE = '#60a5fa';

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-2xl font-bold text-space-100 mb-1">Compare Developers</h1>
        <p className="text-space-400 text-sm mb-8">
          Side-by-side comparison of two GitHub profiles
        </p>

        {/* Input row */}
        <div className="glass rounded-xl p-5 mb-8">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <div className="flex-1 relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-space-400" />
              <input
                id="compare-user1-input"
                value={user1Input}
                onChange={(e) => setUser1Input(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleCompare()}
                placeholder="First GitHub username"
                className="input-field pl-8 text-sm"
              />
            </div>
            <div className="hidden sm:flex items-center text-space-500 font-bold text-sm">VS</div>
            <div className="flex-1 relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-space-400" />
              <input
                id="compare-user2-input"
                value={user2Input}
                onChange={(e) => setUser2Input(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleCompare()}
                placeholder="Second GitHub username"
                className="input-field pl-8 text-sm"
              />
            </div>
            <button
              onClick={handleCompare}
              disabled={!user1Input.trim() || !user2Input.trim() || loading1 || loading2}
              id="compare-btn"
              className="btn-primary flex items-center gap-2 text-sm px-5 py-3 relative z-10 disabled:opacity-40"
            >
              {loading1 || loading2 ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <ArrowRight size={16} />
              )}
              Compare
            </button>
          </div>
          {(error1 || error2) && (
            <div className="mt-3 text-red-400 text-xs flex gap-4">
              {error1 && <span>User 1: {error1}</span>}
              {error2 && <span>User 2: {error2}</span>}
            </div>
          )}
        </div>

        {/* Loading skeletons */}
        {(loading1 || loading2) && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {[1, 2].map((i) => (
              <div key={i} className="glass rounded-2xl p-6 space-y-4">
                <div className="shimmer-bg rounded-full w-20 h-20" />
                <div className="shimmer-bg rounded h-5 w-48" />
                <div className="shimmer-bg rounded h-4 w-32" />
                <div className="grid grid-cols-2 gap-3">
                  {[1, 2, 3, 4].map((j) => (
                    <div key={j} className="shimmer-bg rounded-xl h-16" />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Results */}
        {ready && metrics1 && metrics2 && (
          <div className="space-y-8">
            {/* Profile cards */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <UserCard user={data1!.user} repos={data1!.repos} />
              <UserCard user={data2!.user} repos={data2!.repos} />
            </div>

            {/* Stats table */}
            <div className="glass rounded-2xl overflow-hidden">
              <div className="px-5 py-4 border-b border-space-700/50 flex items-center gap-2">
                <Trophy size={16} className="text-yellow-400" />
                <h2 className="font-semibold text-space-100 text-sm">Head-to-Head Metrics</h2>
              </div>
              <div className="divide-y divide-space-700/30">
                <div className="grid grid-cols-3 px-5 py-2.5 text-xs font-medium text-space-400 bg-space-800/30">
                  <span>Metric</span>
                  <span className="text-center" style={{ color: PURPLE }}>{data1.user.login}</span>
                  <span className="text-center" style={{ color: BLUE }}>{data2.user.login}</span>
                </div>
                {comparisonRows.map(({ label, icon, v1, v2, raw1, raw2 }) => (
                  <div key={label} className="grid grid-cols-3 px-5 py-3 hover:bg-space-800/20 transition-colors">
                    <span className="flex items-center gap-2 text-xs text-space-300">
                      <span className="text-space-400">{icon}</span>
                      {label}
                    </span>
                    <span className={`text-center text-sm font-semibold ${raw1 > raw2 ? 'text-accent-purple' : raw1 < raw2 ? 'text-space-300' : 'text-space-200'}`}>
                      {v1}
                      {raw1 > raw2 && <span className="ml-1 text-xs">🏆</span>}
                    </span>
                    <span className={`text-center text-sm font-semibold ${raw2 > raw1 ? 'text-accent-blue' : raw2 < raw1 ? 'text-space-300' : 'text-space-200'}`}>
                      {v2}
                      {raw2 > raw1 && <span className="ml-1 text-xs">🏆</span>}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Bar chart */}
              <div className="glass rounded-2xl p-5">
                <h3 className="font-semibold text-space-100 text-sm mb-4">Metrics Comparison</h3>
                <ResponsiveContainer width="100%" height={260}>
                  <BarChart data={barData} margin={{ top: 5, right: 5, bottom: 5, left: -20 }}>
                    <XAxis
                      dataKey="metric"
                      tick={{ fill: '#6e7681', fontSize: 11 }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis tick={{ fill: '#6e7681', fontSize: 11 }} axisLine={false} tickLine={false} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#161b22',
                        border: '1px solid #30363d',
                        borderRadius: 8,
                        color: '#e6edf3',
                        fontSize: 12,
                      }}
                    />
                    <Legend
                      wrapperStyle={{ fontSize: 12, color: '#8b949e' }}
                    />
                    <Bar dataKey={data1.user.login} fill={PURPLE} radius={[4, 4, 0, 0]} />
                    <Bar dataKey={data2.user.login} fill={BLUE} radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Radar chart */}
              <div className="glass rounded-2xl p-5">
                <h3 className="font-semibold text-space-100 text-sm mb-4">Developer Profile Radar</h3>
                <ResponsiveContainer width="100%" height={260}>
                  <RadarChart data={radarData}>
                    <PolarGrid stroke="#30363d" />
                    <PolarAngleAxis
                      dataKey="subject"
                      tick={{ fill: '#6e7681', fontSize: 11 }}
                    />
                    <Radar
                      name={data1.user.login}
                      dataKey={data1.user.login}
                      stroke={PURPLE}
                      fill={PURPLE}
                      fillOpacity={0.15}
                    />
                    <Radar
                      name={data2.user.login}
                      dataKey={data2.user.login}
                      stroke={BLUE}
                      fill={BLUE}
                      fillOpacity={0.15}
                    />
                    <Legend wrapperStyle={{ fontSize: 12, color: '#8b949e' }} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#161b22',
                        border: '1px solid #30363d',
                        borderRadius: 8,
                        color: '#e6edf3',
                        fontSize: 12,
                      }}
                    />
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
