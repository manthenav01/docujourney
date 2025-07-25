'use client';

import React from 'react';

interface SalaryChartProps {
  salaryData: Array<{
    range: string;
    count: number;
    minSalary: number;
    maxSalary: number;
  }>;
  stateData: Array<{
    state: string;
    applications: number;
    avgSalary: number;
  }>;
  isActive: boolean;
}

export const SalaryChart: React.FC<SalaryChartProps> = ({ salaryData, stateData, isActive }) => {

  // Transform salary data for visualization - use real data
  const getSalaryDistributionData = () => {
    return salaryData.map((item) => ({
      range: item.range,
      count: item.count,
      percentage: (item.count / salaryData.reduce((sum, d) => sum + d.count, 0)) * 100,
    }));
  };

  // Transform state data for salary by state visualization
  const getStateSalaryData = () => {
    // Get top 8 states by application count for better visualization
    return stateData
      .sort((a, b) => b.applications - a.applications)
      .slice(0, 8)
      .map((item) => ({
        state: item.state,
        avgSalary: item.avgSalary,
        applications: item.applications,
      }));
  };

  const distributionData = getSalaryDistributionData();
  const stateSalaryData = getStateSalaryData();

  const SalaryDistributionChart = ({ data }: any) => (
    <div className="relative h-48 w-full">
      <svg viewBox="0 0 500 250" className="w-full h-full">
        {/* Grid lines */}
        {[40, 80, 120, 160, 200].map(y => (
          <line
            key={y}
            x1="60"
            y1={y}
            x2="460"
            y2={y}
            stroke="#f1f5f9"
            strokeWidth="1"
          />
        ))}
        
        {/* Render bars for salary distribution */}
        {data.map((d: any, idx: number) => {
          const barWidth = Math.min(35, (400 / data.length) * 0.8);
          const x = 60 + (idx * (400 / data.length)) + ((400 / data.length) - barWidth) / 2;
          const maxPercentage = Math.max(...data.map((item: any) => item.percentage));
          const barHeight = (d.percentage / maxPercentage) * 120;
          const y = 180 - barHeight;
          
          return (
            <rect
              key={idx}
              x={x}
              y={y}
              width={barWidth}
              height={barHeight}
              fill="hsl(var(--chart-1))"
              rx="3"
              style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.08))' }}
            />
          );
        })}
        
        {/* X-axis labels */}
        {data.map((d: any, i: number) => {
          const x = 60 + (i * (400 / data.length)) + (400 / data.length) / 2;
          const label = d.range.replace('$', '').replace(' - ', '-');
          return (
            <text
              key={i}
              x={x}
              y="200"
              textAnchor="middle"
              fontSize="11"
              fill="#64748b"
              transform={`rotate(-45, ${x}, 200)`}
            >
              {label.length > 12 ? label.substring(0, 10) + '...' : label}
            </text>
          );
        })}
        
        {/* Y-axis labels */}
        {[0, 25, 50].map((value, i) => (
          <text
            key={value}
            x="50"
            y={180 - (i * 60)}
            textAnchor="end"
            fontSize="12"
            fill="#64748b"
          >
            {value}%
          </text>
        ))}
        
        {/* Y-axis line */}
        <line x1="60" y1="40" x2="60" y2="180" stroke="#e2e8f0" strokeWidth="1"/>
        {/* X-axis line */}
        <line x1="60" y1="180" x2="460" y2="180" stroke="#e2e8f0" strokeWidth="1"/>
      </svg>
    </div>
  );

  const StateSalaryChart = ({ data }: any) => (
    <div className="relative h-48 w-full">
      <svg viewBox="0 0 500 250" className="w-full h-full">
        {/* Grid lines */}
        {[40, 80, 120, 160, 200].map(y => (
          <line
            key={y}
            x1="60"
            y1={y}
            x2="460"
            y2={y}
            stroke="#f1f5f9"
            strokeWidth="1"
          />
        ))}
        
        {/* Render bars for state salaries */}
        {data.map((d: any, idx: number) => {
          const barWidth = Math.min(40, (400 / data.length) * 0.7);
          const x = 60 + (idx * (400 / data.length)) + ((400 / data.length) - barWidth) / 2;
          const minSalary = Math.min(...data.map((item: any) => item.avgSalary));
          const maxSalary = Math.max(...data.map((item: any) => item.avgSalary));
          const normalizedSalary = (d.avgSalary - minSalary) / (maxSalary - minSalary);
          const barHeight = normalizedSalary * 120 + 20; // Add minimum height
          const y = 180 - barHeight;
          
          return (
            <rect
              key={idx}
              x={x}
              y={y}
              width={barWidth}
              height={barHeight}
              fill="hsl(var(--chart-2))"
              rx="3"
              style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.08))' }}
            />
          );
        })}
        
        {/* X-axis labels */}
        {data.map((d: any, i: number) => {
          const x = 60 + (i * (400 / data.length)) + (400 / data.length) / 2;
          return (
            <text
              key={i}
              x={x}
              y="200"
              textAnchor="middle"
              fontSize="12"
              fill="#64748b"
            >
              {d.state}
            </text>
          );
        })}
        
        {/* Y-axis labels */}
        {data.length > 0 && (
          <>
            {[
              Math.min(...data.map((item: any) => item.avgSalary)),
              Math.max(...data.map((item: any) => item.avgSalary)),
            ].map((value, i) => (
              <text
                key={value}
                x="50"
                y={180 - (i * 120)}
                textAnchor="end"
                fontSize="12"
                fill="#64748b"
              >
                ${Math.round(value/1000)}K
              </text>
            ))}
          </>
        )}
        
        {/* Y-axis line */}
        <line x1="60" y1="40" x2="60" y2="180" stroke="#e2e8f0" strokeWidth="1"/>
        {/* X-axis line */}
        <line x1="60" y1="180" x2="460" y2="180" stroke="#e2e8f0" strokeWidth="1"/>
      </svg>
    </div>
  );

  if (!isActive) {return null;}

  return (
    <div className="h-full w-full p-8 bg-card rounded-2xl border border-border/60">
      {/* Two panels side by side */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-full">
        
        {/* Salary Distribution Panel */}
        <div className="bg-muted/30 rounded-xl p-6 border border-border/40">
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-foreground tracking-tight">Salary Distribution</h3>
          </div>
          
          {/* Stats */}
          <div className="mb-4">
            <p className="text-sm text-muted-foreground">
              Total Applications: {salaryData.reduce((sum, d) => sum + d.count, 0).toLocaleString()}
            </p>
          </div>
          
          <SalaryDistributionChart data={distributionData} />
        </div>

        {/* Salary by State Panel */}
        <div className="bg-muted/30 rounded-xl p-6 border border-border/40">
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-foreground tracking-tight">Salary by State</h3>
          </div>
          
          {/* Stats */}
          <div className="mb-4">
            <p className="text-sm text-muted-foreground">
              Top {stateSalaryData.length} States by Application Volume
            </p>
          </div>
          
          <StateSalaryChart data={stateSalaryData} />
        </div>
      </div>
    </div>
  );
};
