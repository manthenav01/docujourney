'use client';

import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/Button';
import { ArrowLeft, Briefcase } from 'lucide-react';

interface JobDashboardProps {
  jobSlug: string;
  jobTitle: string;
}

export const JobDashboard: React.FC<JobDashboardProps> = ({
  jobSlug,
  jobTitle,
}) => {
  const router = useRouter();

  const handleBackClick = () => {
    router.push('/h1b-dashboard');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="mb-6">
          <Button 
            onClick={handleBackClick}
            variant="outline" 
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
          
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-gradient-to-br from-purple-600 to-purple-700 rounded-xl shadow-lg">
              <Briefcase className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{jobTitle}</h1>
              <p className="text-gray-600">Job Market Analysis & Insights</p>
            </div>
          </div>
        </div>

        {/* Placeholder Content */}
        <Card>
          <CardHeader>
            <CardTitle>Job Analysis Coming Soon</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-12">
              <div className="text-gray-500 text-lg mb-4">
                Detailed job analysis coming soon
              </div>
              <div className="text-gray-400">
                This page will show:
              </div>
              <ul className="text-gray-400 mt-2 space-y-1">
                <li>• Salary trends and ranges</li>
                <li>• Top companies hiring for this role</li>
                <li>• Geographic distribution</li>
                <li>• Required skills and qualifications</li>
                <li>• Career progression paths</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
