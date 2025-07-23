import { Suspense } from 'react';
import VisaDashboard from '@/components/VisaDashboard';

export default function VisaDashboardPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            U.S. Visa Sponsorship Dashboard
          </h1>
          <p className="text-lg text-gray-600">
            Explore immigration sponsorship data and trends from top employers
          </p>
        </div>
        
        <Suspense fallback={
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        }>
          <VisaDashboard />
        </Suspense>
      </div>
    </div>
  );
}
