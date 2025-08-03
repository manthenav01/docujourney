'use client';

import React from 'react';
import { Card, CardContent } from '@docujourney/ui';
import { TrendingUp, TrendingDown, DollarSign, Target, CheckCircle2, AlertTriangle } from 'lucide-react';
import { WageLevelData } from '../charts/WageLevelAnalysis';

interface WageLevelInsightCardProps {
  levelData: WageLevelData;
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
 * Get user-friendly wage level description
 */
const getWageLevelInfo = (level: string): { 
  friendlyName: string; 
  description: string; 
  percentileLabel: string;
} => {
  const normalized = level.trim().toUpperCase();
  
  if (normalized === 'I' || normalized === 'LEVEL I') {
    return {
      friendlyName: 'Entry Level',
      description: 'Starting position requiring basic skills',
      percentileLabel: '10th percentile',
    };
  }
  if (normalized === 'II' || normalized === 'LEVEL II') {
    return {
      friendlyName: 'Qualified',
      description: 'Standard professional position',
      percentileLabel: '25th percentile',
    };
  }
  if (normalized === 'III' || normalized === 'LEVEL III') {
    return {
      friendlyName: 'Experienced',
      description: 'Mid-level with specialized skills',
      percentileLabel: '50th percentile',
    };
  }
  if (normalized === 'IV' || normalized === 'LEVEL IV') {
    return {
      friendlyName: 'Senior Expert',
      description: 'Advanced professional with deep expertise',
      percentileLabel: '75th percentile',
    };
  }
  
  return {
    friendlyName: 'Professional',
    description: 'Standard professional position',
    percentileLabel: 'Not specified',
  };
};

/**
 * Get wage competitiveness insights
 */
const getWageInsights = (levelData: WageLevelData) => {
  const hasValidWageData = levelData.avgActualWage > 0 && levelData.avgPrevailingWage > 0;
  
  if (!hasValidWageData) {
    return {
      premiumPercentage: 0,
      premiumAmount: 0,
      competitivenessLevel: 'neutral' as const,
      primaryInsight: 'Wage data not available',
      contextualInfo: 'Check back when more salary data is collected',
      actionGuidance: 'Consider researching similar positions in the market',
    };
  }

  const wageDifference = levelData.avgActualWage - levelData.avgPrevailingWage;
  const premiumPercentage = Math.round((wageDifference / levelData.avgPrevailingWage) * 100);
  const abovePrevailingPercentage = Math.round((levelData.abovePrevailingCount / levelData.applications) * 100);
  
  let competitivenessLevel: 'strong' | 'competitive' | 'neutral' | 'below';
  let primaryInsight: string;
  let contextualInfo: string;
  let actionGuidance: string;

  if (premiumPercentage >= 10) {
    competitivenessLevel = 'strong';
    primaryInsight = `Highly competitive salary - ${premiumPercentage}% above market`;
    contextualInfo = `${abovePrevailingPercentage}% of similar positions pay above government prevailing wage`;
    actionGuidance = 'This indicates strong market demand and excellent positioning for negotiations';
  } else if (premiumPercentage >= 3) {
    competitivenessLevel = 'competitive';
    primaryInsight = `Competitive salary - ${premiumPercentage}% above market`;
    contextualInfo = `${abovePrevailingPercentage}% of similar positions exceed prevailing wage standards`;
    actionGuidance = 'Good market position with room for growth in future negotiations';
  } else if (premiumPercentage >= -3) {
    competitivenessLevel = 'neutral';
    primaryInsight = `Market-rate salary - within ${Math.abs(premiumPercentage)}% of standard`;
    contextualInfo = `${abovePrevailingPercentage}% of positions in this category pay above prevailing wage`;
    actionGuidance = 'Standard compensation - consider highlighting other benefits or growth potential';
  } else {
    competitivenessLevel = 'below';
    primaryInsight = `Below market rate - ${Math.abs(premiumPercentage)}% under standard`;
    contextualInfo = `Only ${abovePrevailingPercentage}% of similar positions exceed prevailing wage`;
    actionGuidance = 'Consider negotiating salary increase or exploring alternative compensation';
  }

  return {
    premiumPercentage,
    premiumAmount: wageDifference,
    competitivenessLevel,
    primaryInsight,
    contextualInfo,
    actionGuidance,
  };
};

/**
 * Get status styling based on competitiveness level
 */
const getStatusStyling = (level: 'strong' | 'competitive' | 'neutral' | 'below') => {
  switch (level) {
    case 'strong':
      return {
        bgColor: 'bg-green-50 border-green-200',
        textColor: 'text-green-800',
        iconColor: 'text-green-600',
        icon: CheckCircle2,
        ringColor: 'ring-green-500/20',
      };
    case 'competitive':
      return {
        bgColor: 'bg-blue-50 border-blue-200',
        textColor: 'text-blue-800',
        iconColor: 'text-blue-600',
        icon: TrendingUp,
        ringColor: 'ring-blue-500/20',
      };
    case 'neutral':
      return {
        bgColor: 'bg-amber-50 border-amber-200',
        textColor: 'text-amber-800',
        iconColor: 'text-amber-600',
        icon: Target,
        ringColor: 'ring-amber-500/20',
      };
    case 'below':
      return {
        bgColor: 'bg-red-50 border-red-200',
        textColor: 'text-red-800',
        iconColor: 'text-red-600',
        icon: AlertTriangle,
        ringColor: 'ring-red-500/20',
      };
    default:
      return {
        bgColor: 'bg-gray-50 border-gray-200',
        textColor: 'text-gray-800',
        iconColor: 'text-gray-600',
        icon: DollarSign,
        ringColor: 'ring-gray-500/20',
      };
  }
};

export const WageLevelInsightCard: React.FC<WageLevelInsightCardProps> = ({
  levelData,
  className = '',
}) => {
  const levelInfo = getWageLevelInfo(levelData.level);
  const insights = getWageInsights(levelData);
  const styling = getStatusStyling(insights.competitivenessLevel);
  const StatusIcon = styling.icon;

  return (
    <Card className={`${className} hover:shadow-lg transition-all duration-300`}>
      <CardContent className="p-6">
        {/* Header with level and status */}
        <div className="flex items-start justify-between mb-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h3 className="text-xl font-semibold text-foreground">
                {levelData.level.length <= 3 ? `Level ${levelData.level}` : levelData.level}
              </h3>
              <div className={`px-3 py-1 rounded-full text-xs font-medium ${styling.bgColor} ${styling.textColor} border`}>
                {levelInfo.friendlyName}
              </div>
            </div>
            <p className="text-sm text-muted-foreground">
              {levelInfo.description} • {levelInfo.percentileLabel}
            </p>
          </div>
          
          <div className={`p-3 rounded-xl ${styling.bgColor} ring-1 ${styling.ringColor}`}>
            <StatusIcon className={`w-5 h-5 ${styling.iconColor}`} />
          </div>
        </div>

        {/* Primary Insight - Hero Metric */}
        <div className="mb-6">
          <div className="text-center p-4 bg-gradient-to-r from-primary/5 to-primary/10 rounded-xl border border-primary/10">
            <div className="text-3xl font-bold text-foreground mb-2">
              {insights.premiumPercentage > 0 ? '+' : ''}{insights.premiumPercentage}%
            </div>
            <div className="text-sm font-semibold text-primary mb-1">
              {insights.primaryInsight}
            </div>
            <div className="text-xs text-muted-foreground">
              vs. government prevailing wage
            </div>
          </div>
        </div>

        {/* Wage Comparison */}
        {levelData.avgActualWage > 0 && levelData.avgPrevailingWage > 0 && (
          <div className="space-y-3 mb-6">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Actual Salary</span>
              <span className="text-lg font-semibold text-foreground">
                {formatCurrency(levelData.avgActualWage)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Prevailing Wage</span>
              <span className="text-base text-muted-foreground">
                {formatCurrency(levelData.avgPrevailingWage)}
              </span>
            </div>
            {insights.premiumAmount !== 0 && (
              <div className="flex justify-between items-center pt-2 border-t border-border/50">
                <span className="text-sm font-medium text-muted-foreground">Premium</span>
                <span className={`text-base font-bold ${insights.premiumAmount > 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {insights.premiumAmount > 0 ? '+' : ''}{formatCurrency(insights.premiumAmount)}
                </span>
              </div>
            )}
          </div>
        )}

        {/* Context and Guidance */}
        <div className="space-y-3">
          <div className={`p-3 rounded-lg border ${styling.bgColor} ${styling.textColor}`}>
            <div className="text-xs font-medium uppercase tracking-wider mb-1 opacity-80">
              Market Context
            </div>
            <div className="text-sm">
              {insights.contextualInfo}
            </div>
          </div>
          
          <div className="p-3 bg-muted/30 rounded-lg border border-border/50">
            <div className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-1">
              Guidance
            </div>
            <div className="text-sm text-foreground">
              {insights.actionGuidance}
            </div>
          </div>
        </div>

        {/* Applications Stats */}
        <div className="mt-4 pt-4 border-t border-border/50">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Total Applications</span>
            <span className="font-medium text-foreground">
              {levelData.applications.toLocaleString()}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default WageLevelInsightCard;