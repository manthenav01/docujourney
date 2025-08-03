'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@docujourney/ui';
import { BarChart3, TrendingUp, Target, Award, Users } from 'lucide-react';
import { WageLevelData } from '../charts/WageLevelAnalysis';

interface WageBenchmarkCardProps {
  levelData: WageLevelData;
  allLevelsData: WageLevelData[];
  className?: string;
}

/**
 * Format currency values
 */
const formatCurrency = (amount: number): string => {
  if (amount === 0) {
    return 'N/A';
  }
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

/**
 * Calculate percentile ranking within all levels
 */
const calculatePercentileRanking = (targetLevel: WageLevelData, allLevels: WageLevelData[]): {
  salaryPercentile: number;
  premiumPercentile: number;
  volumePercentile: number;
} => {
  const validLevels = allLevels.filter(l => l.avgActualWage > 0 && l.avgPrevailingWage > 0);
  
  if (validLevels.length === 0) {
    return { salaryPercentile: 50, premiumPercentile: 50, volumePercentile: 50 };
  }

  // Sort by actual wage
  const sortedBySalary = [...validLevels].sort((a, b) => a.avgActualWage - b.avgActualWage);
  const salaryRank = sortedBySalary.findIndex(l => l.level === targetLevel.level) + 1;
  const salaryPercentile = Math.round((salaryRank / sortedBySalary.length) * 100);

  // Sort by premium percentage
  const levelsWithPremium = validLevels.map(l => ({
    ...l,
    premiumPercentage: ((l.avgActualWage - l.avgPrevailingWage) / l.avgPrevailingWage) * 100,
  }));
  const sortedByPremium = levelsWithPremium.sort((a, b) => a.premiumPercentage - b.premiumPercentage);
  const premiumRank = sortedByPremium.findIndex(l => l.level === targetLevel.level) + 1;
  const premiumPercentile = Math.round((premiumRank / sortedByPremium.length) * 100);

  // Sort by application volume
  const sortedByVolume = [...allLevels].sort((a, b) => a.applications - b.applications);
  const volumeRank = sortedByVolume.findIndex(l => l.level === targetLevel.level) + 1;
  const volumePercentile = Math.round((volumeRank / sortedByVolume.length) * 100);

  return { salaryPercentile, premiumPercentile, volumePercentile };
};

/**
 * Generate comparative insights
 */
const generateComparativeInsights = (levelData: WageLevelData, allLevels: WageLevelData[]) => {
  const { salaryPercentile, premiumPercentile, volumePercentile } = calculatePercentileRanking(levelData, allLevels);
  
  const totalApplications = allLevels.reduce((sum, l) => sum + l.applications, 0);
  const marketShare = Math.round((levelData.applications / totalApplications) * 100);
  
  const wagePremiumPercentage = levelData.avgPrevailingWage > 0 ? 
    Math.round(((levelData.avgActualWage - levelData.avgPrevailingWage) / levelData.avgPrevailingWage) * 100) : 0;

  // Find comparable level (closest in salary)
  const otherLevels = allLevels.filter(l => l.level !== levelData.level && l.avgActualWage > 0);
  const closestLevel = otherLevels.reduce((closest, current) => {
    const closestDiff = Math.abs(closest.avgActualWage - levelData.avgActualWage);
    const currentDiff = Math.abs(current.avgActualWage - levelData.avgActualWage);
    return currentDiff < closestDiff ? current : closest;
  }, otherLevels[0]);

  const insights = [];

  // Salary positioning
  if (salaryPercentile >= 75) {
    insights.push({
      type: 'strength',
      title: 'High Salary Tier',
      description: `Ranks in top ${100 - salaryPercentile}% for salary levels across all experience categories`,
      icon: Award,
      color: 'text-green-600',
    });
  } else if (salaryPercentile <= 25) {
    insights.push({
      type: 'opportunity',
      title: 'Entry-Level Positioning',
      description: `Positioned in lower ${salaryPercentile}% for salary - typical for entry-level roles`,
      icon: Users,
      color: 'text-blue-600',
    });
  }

  // Premium competitiveness
  if (premiumPercentile >= 75) {
    insights.push({
      type: 'strength',
      title: 'Premium Wages',
      description: `Among top performers for exceeding government wage standards`,
      icon: TrendingUp,
      color: 'text-green-600',
    });
  } else if (wagePremiumPercentage < 0) {
    insights.push({
      type: 'opportunity',
      title: 'Below Standard Wages',
      description: `Consider negotiating to meet or exceed prevailing wage benchmarks`,
      icon: Target,
      color: 'text-amber-600',
    });
  }

  // Market demand
  if (volumePercentile >= 75) {
    insights.push({
      type: 'strength',
      title: 'High Market Demand',
      description: `${marketShare}% of applications - indicates strong employer demand`,
      icon: BarChart3,
      color: 'text-green-600',
    });
  } else if (volumePercentile <= 25) {
    insights.push({
      type: 'insight',
      title: 'Specialized Role',
      description: `${marketShare}% of applications - represents specialized position category`,
      icon: Target,
      color: 'text-purple-600',
    });
  }

  return {
    insights,
    salaryPercentile,
    premiumPercentile,
    volumePercentile,
    marketShare,
    closestLevel,
  };
};

export const WageBenchmarkCard: React.FC<WageBenchmarkCardProps> = ({
  levelData,
  allLevelsData,
  className = '',
}) => {
  const benchmarkData = generateComparativeInsights(levelData, allLevelsData);
  
  const getLevelDisplayName = (level: string) => {
    return level.length <= 3 ? `Level ${level}` : level;
  };

  return (
    <Card className={`${className}`}>
      <CardHeader className="pb-4">
        <CardTitle className="text-lg font-semibold flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-primary" />
          {getLevelDisplayName(levelData.level)} Benchmark Analysis
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Key Metrics Grid */}
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center p-3 bg-muted/30 rounded-lg">
            <div className="text-xs text-muted-foreground font-medium mb-1">SALARY RANK</div>
            <div className="text-lg font-bold text-foreground">{benchmarkData.salaryPercentile}th</div>
            <div className="text-xs text-muted-foreground">percentile</div>
          </div>
          
          <div className="text-center p-3 bg-muted/30 rounded-lg">
            <div className="text-xs text-muted-foreground font-medium mb-1">MARKET SHARE</div>
            <div className="text-lg font-bold text-foreground">{benchmarkData.marketShare}%</div>
            <div className="text-xs text-muted-foreground">of applications</div>
          </div>
          
          <div className="text-center p-3 bg-muted/30 rounded-lg">
            <div className="text-xs text-muted-foreground font-medium mb-1">PREMIUM RANK</div>
            <div className="text-lg font-bold text-foreground">{benchmarkData.premiumPercentile}th</div>
            <div className="text-xs text-muted-foreground">percentile</div>
          </div>
        </div>

        {/* Comparative Context */}
        {benchmarkData.closestLevel && (
          <div className="p-4 bg-gradient-to-r from-primary/5 to-primary/10 rounded-xl border border-primary/10">
            <h4 className="font-semibold text-foreground mb-2">Most Similar Level</h4>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">
                {getLevelDisplayName(benchmarkData.closestLevel.level)}
              </span>
              <span className="text-sm font-medium text-foreground">
                {formatCurrency(benchmarkData.closestLevel.avgActualWage)}
              </span>
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              Difference: {formatCurrency(Math.abs(levelData.avgActualWage - benchmarkData.closestLevel.avgActualWage))}
            </div>
          </div>
        )}

        {/* Key Insights */}
        <div>
          <h4 className="font-semibold text-foreground mb-3">Competitive Position</h4>
          <div className="space-y-3">
            {benchmarkData.insights.map((insight, index) => {
              const IconComponent = insight.icon;
              return (
                <div key={index} className="flex items-start gap-3 p-3 bg-card border border-border/50 rounded-lg">
                  <IconComponent className={`w-5 h-5 mt-0.5 ${insight.color}`} />
                  <div>
                    <h5 className="font-medium text-foreground text-sm">{insight.title}</h5>
                    <p className="text-xs text-muted-foreground mt-1">{insight.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Benchmark Comparison Visual */}
        <div className="pt-4 border-t border-border/50">
          <h4 className="font-semibold text-foreground mb-3">Performance Indicators</h4>
          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-muted-foreground">Salary Level</span>
                <span className="font-medium">{benchmarkData.salaryPercentile}th percentile</span>
              </div>
              <div className="h-2 bg-muted/30 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-primary rounded-full transition-all duration-500"
                  style={{ width: `${benchmarkData.salaryPercentile}%` }}
                />
              </div>
            </div>
            
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-muted-foreground">Premium Performance</span>
                <span className="font-medium">{benchmarkData.premiumPercentile}th percentile</span>
              </div>
              <div className="h-2 bg-muted/30 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-green-500 rounded-full transition-all duration-500"
                  style={{ width: `${benchmarkData.premiumPercentile}%` }}
                />
              </div>
            </div>
            
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-muted-foreground">Market Demand</span>
                <span className="font-medium">{benchmarkData.volumePercentile}th percentile</span>
              </div>
              <div className="h-2 bg-muted/30 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-blue-500 rounded-full transition-all duration-500"
                  style={{ width: `${benchmarkData.volumePercentile}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default WageBenchmarkCard;