'use client';

import React, { useState } from 'react';

interface TrendChartProps {
  data: Array<{
    fiscalYear: string;
    applications: number;
    avgSalary: number;
    medianSalary: number;
  }>;
  isActive: boolean;
}

export const TrendChart: React.FC<TrendChartProps> = ({ data, isActive }) => {
  const [activeTimeframe, setActiveTimeframe] = useState('1mo');

  // Mock data for the three categories similar to the screenshot
  const categories = [
    { name: 'Technology', color: '#3b82f6', lightColor: '#dbeafe' },
    { name: 'Healthcare', color: '#94a3b8', lightColor: '#f1f5f9' },
    { name: 'Finance', color: '#1e40af', lightColor: '#dbeafe' },
  ];

  // Generate mock uptime data (line chart)
  const generateUptimeData = () => {
    const years = data.map(d => parseInt(d.fiscalYear)).sort();
    return years.map((year, index) => ({
      year,
      tech: 90 + Math.random() * 20 + index * 2,
      healthcare: 85 + Math.random() * 25 + index * 1.5,
      finance: 88 + Math.random() * 22 + index * 1.8,
    }));
  };

  // Generate mock error data (bar chart)
  const generateErrorData = () => {
    const years = data.map(d => parseInt(d.fiscalYear)).sort();
    return years.map((year, index) => ({
      year,
      tech: Math.floor(Math.random() * 40) + 80 + index * 3,
      healthcare: Math.floor(Math.random() * 35) + 85 + index * 2,
      finance: Math.floor(Math.random() * 45) + 75 + index * 4,
    }));
  };

  const uptimeData = generateUptimeData();
  const errorData = generateErrorData();

  const LineChart = ({ data, categories }: any) => (
    <div className="relative h-48 w-full">
      <svg viewBox="0 0 400 200" className="w-full h-full">
        {/* Grid lines */}
        {[0, 50, 100, 150, 200].map(y => (
          <line
            key={y}
            x1="0"
            y1={y}
            x2="400"
            y2={y}
            stroke="#f1f5f9"
            strokeWidth="1"
          />
        ))}
        
        {/* Render lines for each category */}
        {categories.map((category: any, idx: number) => {
          const points = data.map((d: any, i: number) => {
            const x = (i / (data.length - 1)) * 380 + 20;
            const y = 180 - ((d[category.name.toLowerCase()] - 70) / 50) * 160;
            return `${x},${y}`;
          }).join(' ');
          
          return (
            <g key={category.name}>
              <polyline
                points={points}
                fill="none"
                stroke={category.color}
                strokeWidth="2"
                style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))' }}
              />
              {data.map((d: any, i: number) => {
                const x = (i / (data.length - 1)) * 380 + 20;
                const y = 180 - ((d[category.name.toLowerCase()] - 70) / 50) * 160;
                return (
                  <circle
                    key={i}
                    cx={x}
                    cy={y}
                    r="3"
                    fill={category.color}
                  />
                );
              })}
            </g>
          );
        })}
        
        {/* X-axis labels */}
        {data.map((d: any, i: number) => {
          const x = (i / (data.length - 1)) * 380 + 20;
          return (
            <text
              key={i}
              x={x}
              y="195"
              textAnchor="middle"
              fontSize="12"
              fill="#64748b"
            >
              {d.year}
            </text>
          );
        })}
        
        {/* Y-axis labels */}
        {[70, 105, 140].map((value, i) => (
          <text
            key={value}
            x="10"
            y={180 - (i * 50)}
            textAnchor="end"
            fontSize="12"
            fill="#64748b"
          >
            {value}
          </text>
        ))}
      </svg>
    </div>
  );

  const BarChart = ({ data, categories }: any) => (
    <div className="relative h-48 w-full">
      <svg viewBox="0 0 400 200" className="w-full h-full">
        {/* Grid lines */}
        {[0, 50, 100, 150, 200].map(y => (
          <line
            key={y}
            x1="0"
            y1={y}
            x2="400"
            y2={y}
            stroke="#f1f5f9"
            strokeWidth="1"
          />
        ))}
        
        {/* Render bars for each category */}
        {data.map((d: any, yearIdx: number) => {
          const barWidth = 60 / categories.length;
          const groupX = (yearIdx / (data.length - 1)) * 320 + 40;
          
          return categories.map((category: any, catIdx: number) => {
            const barHeight = ((d[category.name.toLowerCase()] - 60) / 80) * 160;
            const x = groupX + (catIdx - 1) * barWidth;
            const y = 180 - barHeight;
            
            return (
              <rect
                key={`${yearIdx}-${catIdx}`}
                x={x}
                y={y}
                width={barWidth - 2}
                height={barHeight}
                fill={category.color}
                rx="2"
                style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))' }}
              />
            );
          });
        })}
        
        {/* X-axis labels */}
        {data.map((d: any, i: number) => {
          const x = (i / (data.length - 1)) * 320 + 40;
          return (
            <text
              key={i}
              x={x}
              y="195"
              textAnchor="middle"
              fontSize="12"
              fill="#64748b"
            >
              {d.year}
            </text>
          );
        })}
        
        {/* Y-axis labels */}
        {[60, 100, 140].map((value, i) => (
          <text
            key={value}
            x="30"
            y={180 - (i * 40)}
            textAnchor="end"
            fontSize="12"
            fill="#64748b"
          >
            {value}
          </text>
        ))}
      </svg>
    </div>
  );

  if (!isActive) {return null;}

  return (
    <div className="h-full w-full p-6 bg-white rounded-lg">
      {/* Two panels side by side */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-full">
        
        {/* Uptime Panel */}
        <div className="bg-gray-50 rounded-xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Applications</h3>
            <div className="flex bg-white rounded-lg p-1 shadow-sm">
              {['24h', '7d', '1mo'].map((timeframe) => (
                <button
                  key={timeframe}
                  onClick={() => setActiveTimeframe(timeframe)}
                  className={`px-3 py-1 text-sm font-medium rounded-md transition-all ${
                    activeTimeframe === timeframe
                      ? 'bg-gray-900 text-white'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  {timeframe}
                </button>
              ))}
            </div>
          </div>
          
          {/* Legend */}
          <div className="flex items-center gap-6 mb-4">
            {categories.map((category) => (
              <div key={category.name} className="flex items-center gap-2">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: category.color }}
                />
                <span className="text-sm font-medium text-gray-700">
                  {category.name}
                </span>
              </div>
            ))}
          </div>
          
          <LineChart data={uptimeData} categories={categories} />
        </div>

        {/* Errors Panel */}
        <div className="bg-gray-50 rounded-xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Approvals</h3>
            <div className="flex bg-white rounded-lg p-1 shadow-sm">
              {['24h', '7d', '1mo'].map((timeframe) => (
                <button
                  key={timeframe}
                  onClick={() => setActiveTimeframe(timeframe)}
                  className={`px-3 py-1 text-sm font-medium rounded-md transition-all ${
                    activeTimeframe === timeframe
                      ? 'bg-gray-900 text-white'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  {timeframe}
                </button>
              ))}
            </div>
          </div>
          
          {/* Legend */}
          <div className="flex items-center gap-6 mb-4">
            {categories.map((category) => (
              <div key={category.name} className="flex items-center gap-2">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: category.color }}
                />
                <span className="text-sm font-medium text-gray-700">
                  {category.name}
                </span>
              </div>
            ))}
          </div>
          
          <BarChart data={errorData} categories={categories} />
        </div>
      </div>
    </div>
  );
};
