import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'GitExplorer — GitHub Profile & Repository Explorer',
  description:
    'Explore GitHub profiles, compare developers, analyze repos with AI, and chat about any repository. Powered by the GitHub API and Groq AI.',
  keywords: ['GitHub', 'profile explorer', 'repository analyzer', 'AI', 'developer tools'],
  openGraph: {
    title: 'GitExplorer',
    description: 'AI-powered GitHub Profile & Repository Explorer',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-space-900 text-space-100 antialiased">
        <div className="fixed inset-0 pointer-events-none">
          {/* Ambient glow effects */}
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-accent-purple opacity-5 rounded-full blur-3xl" />
          <div className="absolute top-1/4 right-1/4 w-64 h-64 bg-accent-blue opacity-5 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 left-1/3 w-80 h-80 bg-accent-cyan opacity-3 rounded-full blur-3xl" />
        </div>
        <div className="relative z-10">
          {children}
        </div>
      </body>
    </html>
  );
}
