import Link from 'next/link';
import Navbar from '@/components/Navbar';
import { AlertCircle, Home } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-black text-zinc-100">
      <Navbar />
      <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 text-center">
        <AlertCircle size={32} className="text-zinc-500 mb-3" />
        <h1 className="text-xl font-bold text-white mb-1">Not Found</h1>
        <p className="text-zinc-400 text-xs mb-6 max-w-xs">
          The requested GitHub profile or repository could not be found.
        </p>
        <Link href="/" className="bg-white text-black text-xs font-medium px-4 py-2 rounded flex items-center gap-1.5 hover:bg-zinc-200 transition-colors">
          <Home size={13} />
          Go Home
        </Link>
      </div>
    </div>
  );
}
