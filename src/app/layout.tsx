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
      <body className="min-h-screen bg-[#0d1117] text-[#e6edf3] antialiased">
        {children}
      </body>
    </html>
  );
}
