import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'GitExplorer',
  description: 'GitHub Profile & Repository Explorer',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-black text-zinc-100 antialiased">
        {children}
      </body>
    </html>
  );
}
