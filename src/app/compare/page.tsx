import { Suspense } from 'react';
import ComparePage from './ComparePage';

export const metadata = {
  title: 'Compare Developers — GitExplorer',
  description: 'Compare two GitHub developers side-by-side with charts and metrics.',
};

export default function ComparePageWrapper() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center text-space-400 text-sm">
        Loading compare...
      </div>
    }>
      <ComparePage />
    </Suspense>
  );
}
