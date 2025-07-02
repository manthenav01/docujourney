import Link from 'next/link';
import { ArrowLeft, ExternalLink } from 'lucide-react';

export default function VisaDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link 
                href="/" 
                className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Home
              </Link>
              <div className="text-gray-300">|</div>
              <h1 className="text-xl font-semibold text-gray-900">
                Visa Dashboard
              </h1>
            </div>
            
            <div className="flex items-center space-x-4">
              <Link
                href="/api/petitions/stats"
                target="_blank"
                className="flex items-center text-sm text-gray-600 hover:text-gray-900 transition-colors"
              >
                <ExternalLink className="h-4 w-4 mr-1" />
                API Docs
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t mt-12">
        <div className="container mx-auto px-4 py-6">
          <div className="text-center text-sm text-gray-600">
            <p>
              Data sourced from U.S. immigration records. 
              <span className="mx-2">•</span>
              Updated regularly from official government filings.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
