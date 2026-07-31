import Navbar from '@/components/Navbar';
import SearchBar from '@/components/SearchBar';
import NotesPanel from '@/components/NotesPanel';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[#0d1117] text-[#e6edf3]">
      <Navbar />

      <main className="max-w-4xl mx-auto px-4 py-12 space-y-10">
        <section className="text-center space-y-4 pt-4">
          <h1 className="text-2xl sm:text-3xl font-semibold text-[#f0f6fc] tracking-tight">
            GitHub Explorer
          </h1>
          <p className="text-[#8b949e] text-sm max-w-md mx-auto">
            Search GitHub profiles, view repository data, compare developers, and chat with repository contexts.
          </p>
          <div className="pt-2">
            <SearchBar />
          </div>
        </section>

        <section className="pt-6 border-t border-[#30363d]">
          <h2 className="text-sm font-semibold text-[#f0f6fc] mb-4">Saved Notes</h2>
          <NotesPanel showAll />
        </section>
      </main>
    </div>
  );
}
