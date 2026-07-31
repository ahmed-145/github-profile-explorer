import Navbar from '@/components/Navbar';
import SearchBar from '@/components/SearchBar';
import NotesPanel from '@/components/NotesPanel';
import { Github, Star, GitBranch, Users, Bot, StickyNote } from 'lucide-react';

const features = [
  {
    icon: Github,
    title: 'Profile Explorer',
    desc: 'Deep-dive into any GitHub profile with full stats, language breakdown, and repos.',
  },
  {
    icon: Users,
    title: 'User Comparison',
    desc: 'Compare two developers side-by-side with visual metric charts.',
  },
  {
    icon: Bot,
    title: 'AI Analysis',
    desc: 'Get AI-powered developer insights and archetypes streamed live.',
  },
  {
    icon: GitBranch,
    title: 'Repo Chat',
    desc: 'Chat with AI grounded in repository README, commits, and file structure.',
  },
  {
    icon: Star,
    title: 'Smart Notes',
    desc: 'Save persistent notes about any profile or repository.',
  },
];

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[#0d1117] text-[#e6edf3]">
      <Navbar />

      <section className="pt-16 pb-12 px-4 text-center">
        <div className="max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#161b22] border border-[#30363d] text-xs text-[#58a6ff] mb-6">
            <Bot size={12} />
            AI GitHub Explorer
          </div>

          <h1 className="text-3xl sm:text-5xl font-bold text-[#f0f6fc] mb-4 tracking-tight">
            Explore GitHub Profiles
          </h1>

          <p className="text-[#8b949e] text-base max-w-xl mx-auto mb-8 leading-relaxed">
            Search users, compare profiles, analyze repositories, and chat with AI.
          </p>

          <SearchBar />
        </div>
      </section>

      <section className="py-10 px-4">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-center text-lg font-semibold text-[#f0f6fc] mb-6">Features</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {features.map(({ icon: Icon, title, desc }) => (
              <div
                key={title}
                className="bg-[#161b22] border border-[#30363d] rounded-lg p-5 hover:border-[#8b949e] transition-colors"
              >
                <Icon size={18} className="text-[#58a6ff] mb-3" />
                <h3 className="font-medium text-[#f0f6fc] text-sm mb-1">{title}</h3>
                <p className="text-[#8b949e] text-xs leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-8 px-4 pb-16">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center gap-2 mb-4">
            <StickyNote size={16} className="text-[#8b949e]" />
            <h2 className="text-base font-semibold text-[#f0f6fc]">Your Notes</h2>
          </div>
          <NotesPanel showAll />
        </div>
      </section>
    </div>
  );
}
