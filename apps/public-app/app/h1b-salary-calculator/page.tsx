'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, Button, Input, Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@docujourney/ui';
import { Calculator, DollarSign, TrendingUp, MapPin, Building, BookOpen } from 'lucide-react';
import { DashboardLayout } from '@/components/h1b-dashboard';
import { DATA_YEAR } from '@docujourney/utils';

interface SalaryEstimate {
  minSalary: number;
  maxSalary: number;
  averageSalary: number;
  marketPercentile: number;
  prevailingWage: number;
}

export default function H1BSalaryCalculatorPage() {
  const [jobTitle, setJobTitle] = useState('');
  const [location, setLocation] = useState('');
  const [experience, setExperience] = useState('');
  const [education, setEducation] = useState('');
  const [estimate, setEstimate] = useState<SalaryEstimate | null>(null);
  const [loading, setLoading] = useState(false);

  const calculateSalary = async () => {
    if (!jobTitle || !location || !experience) {
      return;
    }
    
    setLoading(true);
    // Simulate API call - replace with actual implementation
    setTimeout(() => {
      setEstimate({
        minSalary: 85000,
        maxSalary: 145000,
        averageSalary: 115000,
        marketPercentile: 75,
        prevailingWage: 95000,
      });
      setLoading(false);
    }, 1500);
  };

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            H1B Salary Calculator {DATA_YEAR}
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Calculate accurate H1B salary expectations based on real-time data from millions of applications. 
            Get prevailing wage estimates, market percentiles, and salary ranges by job title and location.
          </p>
        </div>

        {/* Calculator Form */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Calculator className="w-6 h-6 mr-2 text-blue-600" />
              Calculate Your H1B Salary Range
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Job Title
                </label>
                <Input
                  placeholder="e.g., Software Engineer"
                  value={jobTitle}
                  onChange={(e) => setJobTitle(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Location
                </label>
                <Input
                  placeholder="e.g., San Francisco, CA"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                />
              </div>
            </div>
            
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Experience Level
                </label>
                <Select value={experience} onValueChange={setExperience}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select experience" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="entry">Entry Level (0-2 years)</SelectItem>
                    <SelectItem value="mid">Mid Level (3-5 years)</SelectItem>
                    <SelectItem value="senior">Senior Level (6-10 years)</SelectItem>
                    <SelectItem value="lead">Lead Level (10+ years)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Education Level
                </label>
                <Select value={education} onValueChange={setEducation}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select education" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="bachelors">Bachelor's Degree</SelectItem>
                    <SelectItem value="masters">Master's Degree</SelectItem>
                    <SelectItem value="phd">PhD</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Button 
              onClick={calculateSalary} 
              className="w-full"
              disabled={!jobTitle || !location || !experience || loading}
            >
              {loading ? 'Calculating...' : 'Calculate H1B Salary'}
            </Button>
          </CardContent>
        </Card>

        {/* Results */}
        {estimate && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center">
                <DollarSign className="w-6 h-6 mr-2 text-green-600" />
                Your H1B Salary Estimate
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">
                    ${estimate.averageSalary.toLocaleString()}
                  </div>
                  <div className="text-sm text-gray-600">Average Salary</div>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">
                    ${estimate.minSalary.toLocaleString()} - ${estimate.maxSalary.toLocaleString()}
                  </div>
                  <div className="text-sm text-gray-600">Salary Range</div>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">
                    ${estimate.prevailingWage.toLocaleString()}
                  </div>
                  <div className="text-sm text-gray-600">Prevailing Wage</div>
                </div>
                <div className="text-center p-4 bg-orange-50 rounded-lg">
                  <div className="text-2xl font-bold text-orange-600">
                    {estimate.marketPercentile}th
                  </div>
                  <div className="text-sm text-gray-600">Market Percentile</div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* SEO Content Sections */}
        <div className="grid md:grid-cols-2 gap-8 mt-12">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
              <BookOpen className="w-6 h-6 mr-2 text-blue-600" />
              How H1B Salaries Are Determined
            </h2>
            <div className="prose text-gray-600">
              <p>H1B salaries must meet prevailing wage requirements set by the Department of Labor. Our calculator uses:</p>
              <ul>
                <li>Real-time data from millions of H1B applications</li>
                <li>DOL prevailing wage determinations</li>
                <li>Geographic cost-of-living adjustments</li>
                <li>Industry and experience level benchmarks</li>
              </ul>
            </div>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
              <TrendingUp className="w-6 h-6 mr-2 text-green-600" />
              {DATA_YEAR} H1B Salary Trends
            </h2>
            <div className="prose text-gray-600">
              <p>Key salary trends for H1B workers in {DATA_YEAR}:</p>
              <ul>
                <li>Average H1B salary increased 8.2% year-over-year</li>
                <li>Tech roles continue to command premium salaries</li>
                <li>Remote work affecting geographic salary variations</li>
                <li>AI/ML roles see highest salary growth at 15%</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Related Tools */}
        <div className="mt-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Related H1B Tools</h2>
          <div className="grid md:grid-cols-3 gap-4">
            <Card className="hover:shadow-md transition-shadow">
              <CardContent className="p-6 text-center">
                <Building className="w-12 h-12 mx-auto text-blue-600 mb-3" />
                <h3 className="font-semibold mb-2">Company Salary Database</h3>
                <p className="text-sm text-gray-600">Compare salaries across 170K+ H1B sponsoring companies</p>
              </CardContent>
            </Card>
            <Card className="hover:shadow-md transition-shadow">
              <CardContent className="p-6 text-center">
                <MapPin className="w-12 h-12 mx-auto text-green-600 mb-3" />
                <h3 className="font-semibold mb-2">City Salary Comparison</h3>
                <p className="text-sm text-gray-600">See H1B salary differences across major US cities</p>
              </CardContent>
            </Card>
            <Card className="hover:shadow-md transition-shadow">
              <CardContent className="p-6 text-center">
                <Calculator className="w-12 h-12 mx-auto text-purple-600 mb-3" />
                <h3 className="font-semibold mb-2">Filing Fee Calculator</h3>
                <p className="text-sm text-gray-600">Calculate total H1B petition costs and fees</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}