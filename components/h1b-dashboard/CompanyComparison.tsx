'use client';

import React, { useState, useEffect } from 'react';
import { 
  Building, 
  TrendingUp, 
  TrendingDown, 
  Minus, 
  DollarSign, 
  Users, 
  Target,
  Award,
  Plus,
  X,
  Download,
  Share2,
  RefreshCw,
  BarChart3,
  Zap,
  MapPin,
} from 'lucide-react';
import { ComparisonResult, ComparisonEntity } from '@/lib/types/comparison';

// Helper function to get ranking value safely
function getRankingValue(rankings: any, metricName: string): number | undefined {
  if (!rankings) {return undefined;}
  switch (metricName) {
    case 'totalApplications': return rankings.totalApplications;
    case 'approvalRate': return rankings.approvalRate;
    case 'avgSalary': return rankings.avgSalary;
    default: return undefined;
  }
}

interface CompanyComparisonProps {
  className?: string;
  initialEntities?: ComparisonEntity[];
  onComparisonChange?: (result: ComparisonResult) => void;
}

export const CompanyComparison: React.FC<CompanyComparisonProps> = ({
  className = '',
  initialEntities = [],
  onComparisonChange,
}) => {
  const [entities, setEntities] = useState<ComparisonEntity[]>(initialEntities);
  const [comparisonResult, setComparisonResult] = useState<ComparisonResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedMetrics, setSelectedMetrics] = useState([
    'totalApplications',
    'avgSalary',
    'approvalRate',
  ]);
  const [showAddEntity, setShowAddEntity] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchSuggestions, setSearchSuggestions] = useState<any[]>([]);
  const [timeframe, setTimeframe] = useState<'all' | 'last_year' | 'last_2_years' | 'last_5_years'>('last_2_years');

  // Load comparison templates
  useEffect(() => {
    if (entities.length === 0) {
      loadDefaultComparison();
    }
  }, []);

  // Auto-run comparison when entities change
  useEffect(() => {
    if (entities.length >= 2) {
      runComparison();
    }
  }, [entities, selectedMetrics, timeframe]);

  const loadDefaultComparison = async () => {
    try {
      const response = await fetch('/api/comparison?action=templates');
      if (response.ok) {
        const data = await response.json();
        const bigTechTemplate = data.templates.find((t: any) => t.id === 'big-tech-comparison');
        if (bigTechTemplate) {
          setEntities(bigTechTemplate.entities.slice(0, 4));
        }
      }
    } catch (error) {
      console.error('Error loading default comparison:', error);
    }
  };

  const runComparison = async () => {
    if (entities.length < 2) {return;}
    
    setIsLoading(true);
    try {
      const response = await fetch('/api/comparison', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'compare',
          entities,
          config: {
            timeframe,
            includeCorrelations: true,
            includeTrends: true,
            includeMarketAnalysis: true,
            metrics: selectedMetrics.map(id => ({
              id,
              name: getMetricName(id),
              type: getMetricType(id),
              format: getMetricFormat(id),
              higherIsBetter: true,
              category: 'general',
            })),
          },
        }),
      });
      
      if (response.ok) {
        const data = await response.json();
        setComparisonResult(data.result);
        if (onComparisonChange) {
          onComparisonChange(data.result);
        }
      }
    } catch (error) {
      console.error('Error running comparison:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const addEntity = (entity: ComparisonEntity) => {
    if (entities.length < 6 && !entities.find(e => e.id === entity.id)) {
      setEntities([...entities, entity]);
    }
    setShowAddEntity(false);
    setSearchQuery('');
    setSearchSuggestions([]);
  };

  const removeEntity = (entityId: string) => {
    setEntities(entities.filter(e => e.id !== entityId));
  };

  const searchEntities = async (query: string) => {
    if (query.length < 2) {
      setSearchSuggestions([]);
      return;
    }
    
    try {
      const response = await fetch('/api/comparison', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'entitySuggestions',
          type: 'company',
          query,
          limit: 8,
        }),
      });
      
      if (response.ok) {
        const data = await response.json();
        setSearchSuggestions(data.suggestions || []);
      }
    } catch (error) {
      console.error('Error searching entities:', error);
    }
  };

  const formatValue = (value: number, format: string) => {
    switch (format) {
      case 'currency':
        return `$${Math.round(value / 1000)}K`;
      case 'percentage':
        return `${value.toFixed(1)}%`;
      case 'number':
        return value.toLocaleString();
      default:
        return value.toString();
    }
  };

  const getMetricName = (id: string) => {
    const names: Record<string, string> = {
      totalApplications: 'Total Applications',
      avgSalary: 'Average Salary',
      approvalRate: 'Approval Rate',
      medianSalary: 'Median Salary',
    };
    return names[id] || id;
  };

  const getMetricType = (id: string) => {
    const types: Record<string, string> = {
      totalApplications: 'number',
      avgSalary: 'currency',
      approvalRate: 'percentage',
      medianSalary: 'currency',
    };
    return types[id] || 'number';
  };

  const getMetricFormat = (id: string) => {
    return getMetricType(id);
  };

  const getMetricValue = (entity: any, metric: string) => {
    switch (metric) {
      case 'totalApplications':
        return entity.metrics.totalApplications;
      case 'avgSalary':
        return entity.metrics.avgSalary;
      case 'approvalRate':
        return entity.metrics.approvalRate;
      case 'medianSalary':
        return entity.metrics.medianSalary;
      default:
        return 0;
    }
  };

  const getRankColor = (rank: number, total: number) => {
    const percentile = (total - rank + 1) / total;
    if (percentile >= 0.8) {return 'text-green-600 bg-green-50';}
    if (percentile >= 0.6) {return 'text-blue-600 bg-blue-50';}
    if (percentile >= 0.4) {return 'text-yellow-600 bg-yellow-50';}
    return 'text-red-600 bg-red-50';
  };

  const availableMetrics = [
    { id: 'totalApplications', name: 'Total Applications', icon: Users },
    { id: 'avgSalary', name: 'Average Salary', icon: DollarSign },
    { id: 'approvalRate', name: 'Approval Rate', icon: Target },
    { id: 'medianSalary', name: 'Median Salary', icon: Award },
  ];

  return (
    <div className={`bg-white rounded-xl shadow-sm border border-gray-200 ${className}`}>
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <BarChart3 className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Company Comparison</h3>
              <p className="text-sm text-gray-500">
                Compare H1B metrics across {entities.length} companies
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <select
              value={timeframe}
              onChange={(e) => setTimeframe(e.target.value as any)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Time</option>
              <option value="last_year">Last Year</option>
              <option value="last_2_years">Last 2 Years</option>
              <option value="last_5_years">Last 5 Years</option>
            </select>
            
            <button
              onClick={runComparison}
              disabled={isLoading}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>
          </div>
        </div>
      </div>

      {/* Entity Management */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-md font-medium text-gray-900">Companies</h4>
          <button
            onClick={() => setShowAddEntity(true)}
            className="flex items-center space-x-2 px-3 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Add Company</span>
          </button>
        </div>

        <div className="flex flex-wrap gap-2">
          {entities.map((entity, index) => (
            <div
              key={entity.id}
              className="flex items-center space-x-2 px-3 py-2 bg-gray-50 rounded-lg"
            >
              <Building className="w-4 h-4 text-gray-600" />
              <span className="text-sm font-medium text-gray-900">{entity.displayName}</span>
              <button
                onClick={() => removeEntity(entity.id)}
                className="text-gray-400 hover:text-red-500 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>

        {/* Add Entity Modal */}
        {showAddEntity && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-6 w-full max-w-md">
              <h3 className="text-lg font-semibold mb-4">Add Company</h3>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  searchEntities(e.target.value);
                }}
                placeholder="Search companies..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              
              {searchSuggestions.length > 0 && (
                <div className="mt-4 space-y-2 max-h-60 overflow-y-auto">
                  {searchSuggestions.map((suggestion, index) => (
                    <button
                      key={index}
                      onClick={() => addEntity({
                        id: `company_${suggestion.name.toLowerCase().replace(/\s+/g, '_')}`,
                        type: 'employer',
                        displayName: suggestion.displayName,
                      })}
                      className="w-full text-left px-4 py-2 hover:bg-gray-50 rounded-lg transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{suggestion.displayName}</span>
                        <span className="text-sm text-gray-500">{suggestion.count.toLocaleString()}</span>
                      </div>
                    </button>
                  ))}
                </div>
              )}
              
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => setShowAddEntity(false)}
                  className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Metric Selection */}
      <div className="p-6 border-b border-gray-200">
        <h4 className="text-md font-medium text-gray-900 mb-4">Metrics</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {availableMetrics.map((metric) => {
            const Icon = metric.icon;
            const isSelected = selectedMetrics.includes(metric.id);
            return (
              <button
                key={metric.id}
                onClick={() => {
                  if (isSelected) {
                    setSelectedMetrics(selectedMetrics.filter(m => m !== metric.id));
                  } else {
                    setSelectedMetrics([...selectedMetrics, metric.id]);
                  }
                }}
                className={`flex items-center space-x-2 px-3 py-2 rounded-lg border transition-colors ${
                  isSelected
                    ? 'bg-blue-50 border-blue-200 text-blue-700'
                    : 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span className="text-sm font-medium">{metric.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Comparison Results */}
      {isLoading ? (
        <div className="p-12 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-500">Running comparison analysis...</p>
        </div>
      ) : comparisonResult ? (
        <div className="p-6">
          {/* Comparison Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Company</th>
                  {selectedMetrics.map((metric) => (
                    <th key={metric} className="text-center py-3 px-4 font-medium text-gray-700">
                      {getMetricName(metric)}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {comparisonResult.entities.map((entity, index) => (
                  <tr key={entity.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-4 px-4">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-blue-100 rounded-lg">
                          <Building className="w-4 h-4 text-blue-600" />
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">{entity.displayName}</div>
                          <div className="text-sm text-gray-500">{entity.type}</div>
                        </div>
                      </div>
                    </td>
                    {selectedMetrics.map((metric) => {
                      const value = getMetricValue(entity, metric);
                      const rank = getRankingValue(entity.rankings, metric) || 0;
                      const format = getMetricFormat(metric);
                      
                      return (
                        <td key={metric} className="py-4 px-4 text-center">
                          <div className="flex flex-col items-center space-y-1">
                            <span className="font-semibold text-gray-900">
                              {formatValue(value, format)}
                            </span>
                            <div className={`px-2 py-1 rounded-full text-xs font-medium ${getRankColor(rank, entities.length)}`}>
                              #{rank}
                            </div>
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Market Analysis */}
          {comparisonResult.marketAnalysis && (
            <div className="mt-8 p-4 bg-blue-50 rounded-lg">
              <h4 className="font-medium text-blue-900 mb-3">Market Analysis</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <span className="text-blue-600">Top Performer:</span>
                  <div className="font-medium text-blue-900">{comparisonResult.marketAnalysis.summary.topPerformer}</div>
                </div>
                <div>
                  <span className="text-blue-600">Market Leader:</span>
                  <div className="font-medium text-blue-900">{comparisonResult.marketAnalysis.summary.marketLeader}</div>
                </div>
                <div>
                  <span className="text-blue-600">Fastest Growing:</span>
                  <div className="font-medium text-blue-900">{comparisonResult.marketAnalysis.summary.fastestGrowing}</div>
                </div>
                <div>
                  <span className="text-blue-600">Generated:</span>
                  <div className="font-medium text-blue-900">{new Date(comparisonResult.metadata.timestamp).toLocaleTimeString()}</div>
                </div>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="p-12 text-center text-gray-500">
          <BarChart3 className="w-12 h-12 mx-auto mb-4 text-gray-300" />
          <p>Add at least 2 companies to start comparing</p>
        </div>
      )}
    </div>
  );
};