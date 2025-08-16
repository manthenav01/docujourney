import { Card, CardContent, CardHeader, CardTitle } from '@docujourney/ui';
import { TrendingUp } from 'lucide-react';

export function SponsorsListSkeleton() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Page title skeleton */}
      <div className="mb-8" id="sponsors-list">
        <div className="h-9 bg-gray-200 rounded w-96 mb-2 animate-pulse"></div>
        <div className="h-5 bg-gray-200 rounded w-[600px] animate-pulse"></div>
      </div>

      {/* Pagination info skeleton */}
      <div className="text-center mb-4">
        <div className="h-4 bg-gray-200 rounded w-64 mx-auto animate-pulse"></div>
      </div>

      {/* Top pagination skeleton */}
      <div className="flex items-center justify-center space-x-2 mt-8 mb-8">
        <div className="h-10 w-10 bg-gray-200 rounded animate-pulse"></div>
        <div className="h-10 w-10 bg-gray-200 rounded animate-pulse"></div>
        <div className="flex items-center space-x-1">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-10 w-10 bg-gray-200 rounded animate-pulse"></div>
          ))}
        </div>
        <div className="h-10 w-10 bg-gray-200 rounded animate-pulse"></div>
        <div className="h-10 w-10 bg-gray-200 rounded animate-pulse"></div>
      </div>

      {/* Sponsors list skeleton */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center">
            <TrendingUp className="w-6 h-6 mr-2 text-blue-600" />
            H1B Sponsor Companies Directory
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Create 20 skeleton items to match the page size */}
            {[...Array(20)].map((_, index) => (
              <div
                key={index}
                className="border rounded-lg p-6 animate-pulse"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    {/* Company header skeleton */}
                    <div className="flex items-center mb-3">
                      <div className="h-4 w-8 bg-gray-200 rounded mr-3"></div>
                      <div className="h-6 w-64 bg-gray-200 rounded"></div>
                    </div>

                    {/* Stats grid skeleton */}
                    <div className="grid md:grid-cols-5 gap-4 mb-4">
                      {[...Array(5)].map((_, i) => (
                        <div key={i} className="flex items-start space-x-2">
                          <div className="w-4 h-4 bg-gray-200 rounded mt-0.5"></div>
                          <div className="flex-1">
                            <div className="h-3 w-16 bg-gray-200 rounded mb-1"></div>
                            <div className="h-5 w-12 bg-gray-200 rounded"></div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Job titles skeleton */}
                    <div className="flex items-start space-x-2">
                      <div className="w-4 h-4 bg-gray-200 rounded mt-1"></div>
                      <div className="flex-1">
                        <div className="h-3 w-24 bg-gray-200 rounded mb-2"></div>
                        <div className="flex gap-2">
                          <div className="h-6 w-32 bg-gray-200 rounded"></div>
                          <div className="h-6 w-28 bg-gray-200 rounded"></div>
                          <div className="h-6 w-36 bg-gray-200 rounded"></div>
                        </div>
                      </div>
                    </div>

                    {/* Footer skeleton */}
                    <div className="mt-3">
                      <div className="h-3 w-48 bg-gray-200 rounded"></div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Bottom pagination skeleton */}
      <div className="flex items-center justify-center space-x-2 mt-8 mb-8">
        <div className="h-10 w-10 bg-gray-200 rounded animate-pulse"></div>
        <div className="h-10 w-10 bg-gray-200 rounded animate-pulse"></div>
        <div className="flex items-center space-x-1">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-10 w-10 bg-gray-200 rounded animate-pulse"></div>
          ))}
        </div>
        <div className="h-10 w-10 bg-gray-200 rounded animate-pulse"></div>
        <div className="h-10 w-10 bg-gray-200 rounded animate-pulse"></div>
      </div>
    </div>
  );
}