'use client';

import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  Minus, 
  BarChart3, 
  LineChart, 
  Calendar,
  Target,
  Zap,
  Award,
  RefreshCw,
  Download,
  Eye,
  EyeOff,
} from 'lucide-react';
import { LineChart as RechartsLineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TrendData, ComparisonEntity } from '@/lib/types/comparison';

interface TrendComparisonProps {
  entities: ComparisonEntity[];
  className?: string;
  onTrendChange?: (trends: TrendData[]) => void;
}

export const TrendComparison: React.FC<TrendComparisonProps> = ({
  entities,
  className = '',
  onTrendChange,
}) => {
  const [trends, setTrends] = useState<TrendData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedMetric, setSelectedMetric] = useState('applications');
  const [timeframe, setTimeframe] = useState<'last_year' | 'last_2_years' | 'last_5_years'>('last_2_years');
  const [chartType, setChartType] = useState<'line' | 'bar'>('line');
  const [visibleEntities, setVisibleEntities] = useState<Set<string>>(new Set());
  const [chartData, setChartData] = useState<any[]>([]);

  // Available metrics for trend analysis
  const availableMetrics = [
    { id: 'applications', name: 'Applications', icon: BarChart3, color: '#3B82F6' },
    { id: 'avgSalary', name: 'Average Salary', icon: Award, color: '#10B981' },
    { id: 'approvalRate', name: 'Approval Rate', icon: Target, color: '#F59E0B' },
  ];

  // Entity colors for charts
  const entityColors = [
    '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#F97316',
  ];

  useEffect(() => {
    if (entities.length > 0) {
      setVisibleEntities(new Set(entities.map(e => e.id)));
      fetchTrends();
    }
  }, [entities, selectedMetric, timeframe]);

  useEffect(() => {
    if (trends.length > 0) {
      generateChartData();
    }
  }, [trends, selectedMetric, visibleEntities]);

  const fetchTrends = async () => {
    if (entities.length === 0) {return;}
    
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
            includeCorrelations: false,
            includeTrends: true,
            includeMarketAnalysis: false,
            metrics: [selectedMetric],
          },
        }),
      });
      
      if (response.ok) {
        const data = await response.json();
        const trendData = data.result.trends || [];
        setTrends(trendData);
        
        if (onTrendChange) {
          onTrendChange(trendData);
        }
      }
    } catch (error) {
      console.error('Error fetching trends:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const generateChartData = () => {
    const metricTrends = trends.filter(t => t.metric === selectedMetric);
    
    if (metricTrends.length === 0) {
      setChartData([]);
      return;
    }
    
    // Get all unique periods
    const allPeriods = new Set<string>();
    metricTrends.forEach(trend => {
      trend.data.forEach(period => allPeriods.add(period.period));
    });
    
    // Sort periods
    const sortedPeriods = Array.from(allPeriods).sort();
    
    // Generate chart data
    const data = sortedPeriods.map(period => {
      const dataPoint: any = { period };
      
      metricTrends.forEach(trend => {
        const entity = entities.find(e => e.id === trend.entityId);
        if (entity && visibleEntities.has(entity.id)) {
          const periodData = trend.data.find(p => p.period === period);
          dataPoint[entity.name] = periodData ? periodData.value : null;
        }
      });
      
      return dataPoint;
    });
    
    setChartData(data);
  };

  const toggleEntityVisibility = (entityId: string) => {
    const newVisible = new Set(visibleEntities);
    if (newVisible.has(entityId)) {
      newVisible.delete(entityId);
    } else {
      newVisible.add(entityId);
    }
    setVisibleEntities(newVisible);
  };

  const getTrendIcon = (trend: 'increasing' | 'decreasing' | 'stable') => {
    switch (trend) {
      case 'increasing':
        return <TrendingUp className="w-4 h-4 text-green-600" />;
      case 'decreasing':
        return <TrendingDown className="w-4 h-4 text-red-600" />;
      default:
        return <Minus className="w-4 h-4 text-gray-600" />;
    }
  };

  const getTrendColor = (trend: 'increasing' | 'decreasing' | 'stable') => {
    switch (trend) {
      case 'increasing':
        return 'text-green-600 bg-green-50';
      case 'decreasing':
        return 'text-red-600 bg-red-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  const formatValue = (value: number, metric: string) => {
    switch (metric) {
      case 'avgSalary':
        return `$${Math.round(value / 1000)}K`;
      case 'approvalRate':
        return `${value.toFixed(1)}%`;
      default:
        return value.toLocaleString();
    }
  };

  const formatTooltipValue = (value: number, name: string) => {
    return [formatValue(value, selectedMetric), name];
  };

  const currentMetric = availableMetrics.find(m => m.id === selectedMetric);

  return (
    <div className={`bg-white rounded-xl shadow-sm border border-gray-200 ${className}`}>
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <LineChart className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Trend Analysis</h3>
              <p className="text-sm text-gray-500">
                Track changes over time for {entities.length} entities
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <select
              value={timeframe}
              onChange={(e) => setTimeframe(e.target.value as any)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="last_year">Last Year</option>
              <option value="last_2_years">Last 2 Years</option>
              <option value="last_5_years">Last 5 Years</option>
            </select>
            
            <button
              onClick={fetchTrends}
              disabled={isLoading}
              className="flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 transition-colors"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>
          </div>
        </div>
      </div>

      {/* Metric Selection */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-md font-medium text-gray-900">Metric</h4>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setChartType('line')}
              className={`p-2 rounded-lg transition-colors ${
                chartType === 'line' 
                  ? 'bg-purple-100 text-purple-600' 
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <LineChart className="w-4 h-4" />
            </button>
            <button
              onClick={() => setChartType('bar')}
              className={`p-2 rounded-lg transition-colors ${
                chartType === 'bar' 
                  ? 'bg-purple-100 text-purple-600' 
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <BarChart3 className="w-4 h-4" />
            </button>
          </div>
        </div>
        
        <div className="grid grid-cols-3 gap-3">
          {availableMetrics.map((metric) => {
            const Icon = metric.icon;
            const isSelected = selectedMetric === metric.id;
            return (
              <button
                key={metric.id}
                onClick={() => setSelectedMetric(metric.id)}
                className={`flex items-center space-x-2 px-4 py-3 rounded-lg border transition-colors ${
                  isSelected
                    ? 'bg-purple-50 border-purple-200 text-purple-700'
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

      {/* Entity Legend */}
      <div className="p-6 border-b border-gray-200">
        <h4 className="text-md font-medium text-gray-900 mb-4">Entities</h4>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {entities.map((entity, index) => {
            const isVisible = visibleEntities.has(entity.id);
            const color = entityColors[index % entityColors.length];
            
            return (
              <button
                key={entity.id}
                onClick={() => toggleEntityVisibility(entity.id)}
                className={`flex items-center space-x-2 px-3 py-2 rounded-lg border transition-colors ${
                  isVisible 
                    ? 'bg-white border-gray-300' 
                    : 'bg-gray-50 border-gray-200 opacity-50'
                }`}
              >
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: isVisible ? color : '#D1D5DB' }}
                />
                <span className="text-sm font-medium text-gray-900">{entity.name}</span>
                {isVisible ? (
                  <Eye className="w-4 h-4 text-gray-400" />
                ) : (
                  <EyeOff className="w-4 h-4 text-gray-400" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Chart */}
      <div className="p-6">
        {isLoading ? (
          <div className="h-80 flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500 mx-auto mb-4"></div>
              <p className="text-gray-500">Loading trend data...</p>
            </div>
          </div>
        ) : chartData.length > 0 ? (
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <RechartsLineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                <XAxis 
                  dataKey="period" 
                  stroke="#6b7280"
                  fontSize={12}
                />
                <YAxis 
                  stroke="#6b7280"
                  fontSize={12}
                  tickFormatter={(value) => formatValue(value, selectedMetric)}
                />
                <Tooltip 
                  formatter={formatTooltipValue}
                  labelStyle={{ color: '#374151' }}
                  contentStyle={{ 
                    backgroundColor: '#fff', 
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                  }}
                />
                <Legend />
                {entities.map((entity, index) => {
                  if (!visibleEntities.has(entity.id)) {return null;}
                  
                  return (
                    <Line
                      key={entity.id}
                      type="monotone"
                      dataKey={entity.name}
                      stroke={entityColors[index % entityColors.length]}
                      strokeWidth={2}
                      dot={{ fill: entityColors[index % entityColors.length], strokeWidth: 2, r: 4 }}
                      activeDot={{ r: 6, stroke: entityColors[index % entityColors.length] }}
                    />
                  );
                })}
              </RechartsLineChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="h-80 flex items-center justify-center text-gray-500">
            <div className="text-center">
              <LineChart className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p>No trend data available</p>
              <p className="text-sm">Try adjusting the timeframe or adding more entities</p>
            </div>
          </div>
        )}
      </div>

      {/* Trend Summary */}
      {trends.length > 0 && (
        <div className="p-6 border-t border-gray-200">
          <h4 className="text-md font-medium text-gray-900 mb-4">Trend Summary</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {trends
              .filter(t => t.metric === selectedMetric)
              .map((trend) => {
                const entity = entities.find(e => e.id === trend.entityId);
                if (!entity) {return null;}
                
                return (
                  <div key={trend.entityId} className="p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-gray-900">{entity.name}</span>
                    </div>
                    <div className="text-sm text-gray-600">
                      <div className="flex items-center justify-between mt-1">
                        <span>Data Points:</span>
                        <span className="font-medium">{trend.data.length}</span>
                      </div>
                      <div className="flex items-center justify-between mt-1">
                        <span>Metric:</span>
                        <span className="font-medium">{trend.metric}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      )}
    </div>
  );
};