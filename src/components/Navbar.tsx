'use client';

import Link from 'next/link';
import { Github, GitBranch, Users, BarChart3, StickyNote } from 'lucide-react';
import { usePathname } from 'next/navigation';
import clsx from 'clsx';

const navLinks = [
  { href: '/', label: 'Explorer', icon: Github },
  { href: '/compare', label: 'Compare', icon: Users },
];

export default function Navbar() {
  const pathname = usePathname();

  return (
    <nav className="glass-strong sticky top-0 z-50 border-b border-space-700/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-accent-purple to-accent-blue flex items-center justify-center shadow-glow-purple group-hover:shadow-glow-blue transition-shadow">
              <GitBranch size={16} className="text-white" />
            </div>
            <span className="font-bold text-space-100 text-lg">
              Git<span className="gradient-text">Explorer</span>
            </span>
          </Link>

          {/* Nav links */}
          <div className="flex items-center gap-1">
            {navLinks.map(({ href, label, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                className={clsx(
                  'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all',
                  pathname === href
                    ? 'bg-accent-purple/10 text-accent-purple border border-accent-purple/20'
                    : 'text-space-300 hover:text-space-100 hover:bg-space-700/50'
                )}
              >
                <Icon size={14} />
                {label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </nav>
  );
}
