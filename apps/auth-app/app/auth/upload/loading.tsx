import { Card, CardContent, CardHeader, CardTitle, Skeleton } from '@docujourney/ui';

export default function UploadLoading() {
  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-8">
        <Skeleton className="h-9 w-64 mb-2" />
        <Skeleton className="h-5 w-96" />
      </div>

      {/* Profile and Document Type Selection Skeletons */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {/* Profile Selection Skeleton */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Select Profile</CardTitle>
          </CardHeader>
          <CardContent>
            <Skeleton className="h-10 w-full" />
          </CardContent>
        </Card>

        {/* Document Type Selection Skeleton */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Document Type</CardTitle>
          </CardHeader>
          <CardContent>
            <Skeleton className="h-10 w-full" />
          </CardContent>
        </Card>
      </div>

      {/* Main Upload Area Skeleton */}
      <Card>
        <CardHeader>
          <CardTitle>
            <Skeleton className="h-7 w-48" />
          </CardTitle>
        </CardHeader>
        <CardContent className="min-h-[400px] flex flex-col items-center justify-center space-y-4">
          <Skeleton className="h-20 w-20 rounded-full" />
          <Skeleton className="h-6 w-64" />
          <Skeleton className="h-4 w-48" />
          <Skeleton className="h-10 w-32" />
        </CardContent>
      </Card>
    </div>
  );
}
