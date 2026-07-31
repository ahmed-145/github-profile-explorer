import Link from 'next/link';
import Navbar from '@/components/Navbar';
import { AlertCircle, Home, Search } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="flex flex-col items-center justify-center min-h-[70vh] px-4 text-center">
        <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-red-500/20 to-accent-orange/20 flex items-center justify-center mb-6">
          <AlertCircle size={36} className="text-red-400" />
        </div>
        <h1 className="text-3xl font-bold text-space-100 mb-2">Not Found</h1>
        <p className="text-space-400 mb-8 max-w-sm">
          The GitHub user or repository you&apos;re looking for doesn&apos;t exist or couldn&apos;t be found.
        </p>
        <div className="flex gap-3">
          <Link href="/" className="btn-primary flex items-center gap-2 text-sm px-5 py-2.5 relative z-10">
            <Home size={16} />
            Go Home
          </Link>
          <Link href="/" className="btn-secondary flex items-center gap-2 text-sm px-5 py-2.5">
            <Search size={16} />
            New Search
          </Link>
        </div>
      </div>
    </div>
  );
}
