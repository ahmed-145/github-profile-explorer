import Navbar from '@/components/Navbar';
import SearchBar from '@/components/SearchBar';
import NotesPanel from '@/components/NotesPanel';
import { Github, Star, GitBranch, Users, Bot, StickyNote } from 'lucide-react';

const features = [
  {
    icon: Github,
    title: 'Profile Explorer',
    desc: 'Deep-dive into any GitHub profile with full stats, language breakdown, and all repositories.',
    color: 'text-accent-purple',
    bg: 'from-accent-purple/10 to-accent-blue/10',
  },
  {
    icon: Users,
    title: 'User Comparison',
    desc: 'Compare two developers side-by-side with visual charts for followers, stars, repos, and more.',
    color: 'text-accent-blue',
    bg: 'from-accent-blue/10 to-accent-cyan/10',
  },
  {
    icon: Bot,
    title: 'AI Analysis',
    desc: 'Get an AI-powered developer archetype, skill assessment, and career insights — streamed live.',
    color: 'text-accent-pink',
    bg: 'from-accent-pink/10 to-accent-purple/10',
  },
  {
    icon: GitBranch,
    title: 'Repo Chat',
    desc: 'Chat with an AI grounded in a repo\'s README, commits, and file structure. History persists.',
    color: 'text-accent-cyan',
    bg: 'from-accent-cyan/10 to-accent-blue/10',
  },
  {
    icon: Star,
    title: 'Smart Notes',
    desc: 'Save notes about any profile or repository. They\'re shown every time you visit.',
    color: 'text-yellow-400',
    bg: 'from-yellow-400/10 to-accent-orange/10',
  },
];

export default function HomePage() {
  return (
    <div className="min-h-screen">
      <Navbar />

      {/* Hero Section */}
      <section className="relative pt-20 pb-16 px-4 text-center">
        {/* Decorative orbs */}
        <div className="absolute top-8 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-gradient-to-r from-accent-purple/10 via-accent-blue/10 to-accent-cyan/10 blur-3xl rounded-full pointer-events-none" />

        <div className="relative max-w-4xl mx-auto">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full glass border border-accent-purple/20 text-xs text-accent-purple mb-6">
            <Bot size={12} />
            AI-Powered GitHub Explorer
          </div>

          {/* Headline */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-space-100 mb-4 leading-tight">
            Explore GitHub Profiles
            <br />
            <span className="gradient-text">with Intelligence</span>
          </h1>

          <p className="text-space-300 text-lg max-w-2xl mx-auto mb-10 leading-relaxed">
            Search any GitHub user, analyze their repos, compare developers, and chat
            with AI about any repository — all in one place.
          </p>

          {/* Search */}
          <SearchBar />
        </div>
      </section>

      {/* Features */}
      <section className="py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-center text-2xl font-bold text-space-100 mb-2">Everything you need</h2>
          <p className="text-center text-space-400 text-sm mb-8">
            A complete toolkit for GitHub profile exploration
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {features.map(({ icon: Icon, title, desc, color, bg }) => (
              <div
                key={title}
                className={`glass rounded-xl p-5 card-hover bg-gradient-to-br ${bg}`}
              >
                <Icon size={22} className={`${color} mb-3`} />
                <h3 className="font-semibold text-space-100 text-sm mb-1.5">{title}</h3>
                <p className="text-space-400 text-xs leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Notes section — shown to all users */}
      <section className="py-8 px-4 pb-16">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center gap-2 mb-4">
            <StickyNote size={18} className="text-accent-orange" />
            <h2 className="text-lg font-bold text-space-100">Your Saved Notes</h2>
          </div>
          <NotesPanel showAll />
        </div>
      </section>
    </div>
  );
}
