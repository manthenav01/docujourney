'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, Button } from '@docujourney/ui';
import { TrendingUp, Lightbulb, Target, AlertCircle, CheckCircle2, Building2, Users, DollarSign, Globe, ChevronDown, ChevronUp, Zap } from 'lucide-react';
import { H1BJobAnalysis } from '../../../lib/types';

interface WageInsightSummaryProps {
  jobData: H1BJobAnalysis;
  className?: string;
  condensed?: boolean; // New prop to control condensed view
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
 * Generate comprehensive market insights from complete job analysis data
 */
const generateJobMarketInsights = (jobData: H1BJobAnalysis) => {
  if (!jobData) {
    return {
      primaryInsight: 'No job market data available',
      insightType: 'neutral' as const,
      keyFindings: [],
      marketTrends: [],
      recommendations: [],
    };
  }

  // Calculate key market metrics
  const certificationRate = jobData.totalApplications > 0 ? 
    Math.round((jobData.certifiedApplications / jobData.totalApplications) * 100) : 0;
  
  const salaryRange = jobData.maxSalary - jobData.minSalary;
  const fullTimePercentage = jobData.totalApplications > 0 ? 
    Math.round((jobData.fullTimePositions / jobData.totalApplications) * 100) : 0;

  // Analyze wage level data for prevailing wage insights
  const validWageLevels = jobData.wageLevelAnalysis?.filter(d => d.avgActualWage > 0 && d.avgPrevailingWage > 0) || [];
  let prevailingWageInsights = null;
  
  if (validWageLevels.length > 0) {
    const totalLevelApplications = validWageLevels.reduce((sum, d) => sum + d.applications, 0);
    const totalAbovePrevailing = validWageLevels.reduce((sum, d) => sum + d.abovePrevailingCount, 0);
    const overallAbovePrevailingRate = Math.round((totalAbovePrevailing / totalLevelApplications) * 100);
    
    const weightedPremiumSum = validWageLevels.reduce((sum, d) => 
      sum + (d.avgActualWage - d.avgPrevailingWage) * d.applications, 0);
    const averagePremium = weightedPremiumSum / totalLevelApplications;
    const totalPrevailing = validWageLevels.reduce((sum, d) => sum + d.avgPrevailingWage * d.applications, 0);
    const averagePremiumPercentage = Math.round((averagePremium / (totalPrevailing / totalLevelApplications)) * 100);
    
    prevailingWageInsights = {
      overallAbovePrevailingRate,
      averagePremiumPercentage,
      levelsAnalyzed: validWageLevels.length,
    };
  }

  // Analyze yearly trends for growth
  let growthTrend = null;
  if (jobData.yearlyTrends && jobData.yearlyTrends.length >= 2) {
    const sortedTrends = jobData.yearlyTrends.sort((a, b) => a.fiscalYear.localeCompare(b.fiscalYear));
    const latest = sortedTrends[sortedTrends.length - 1];
    const previous = sortedTrends[sortedTrends.length - 2];
    
    const applicationGrowth = ((latest.applications - previous.applications) / previous.applications) * 100;
    const salaryGrowth = ((latest.avgSalary - previous.avgSalary) / previous.avgSalary) * 100;
    
    growthTrend = {
      applicationGrowth: Math.round(applicationGrowth),
      salaryGrowth: Math.round(salaryGrowth),
      latestYear: latest.fiscalYear,
      previousYear: previous.fiscalYear,
    };
  }

  // Analyze geographic distribution
  const topState = jobData.topStates?.[0];
  const geographicDiversity = jobData.topStates?.length || 0;

  // Generate primary insight based on multiple factors
  let primaryInsight: string;
  let insightType: 'positive' | 'neutral' | 'concerning' = 'neutral';

  if (certificationRate >= 90 && (prevailingWageInsights?.averagePremiumPercentage || 0) >= 5) {
    primaryInsight = `Excellent market opportunity - ${certificationRate}% approval rate with salaries ${prevailingWageInsights?.averagePremiumPercentage}% above government standards`;
    insightType = 'positive';
  } else if (certificationRate >= 80 && (prevailingWageInsights?.averagePremiumPercentage || 0) >= 0) {
    primaryInsight = `Strong market position - ${certificationRate}% approval rate with competitive compensation`;
    insightType = 'positive';
  } else if (certificationRate >= 70) {
    primaryInsight = `Moderate market opportunity - ${certificationRate}% approval rate indicates standard demand`;
    insightType = 'neutral';
  } else {
    primaryInsight = `Challenging market - ${certificationRate}% approval rate suggests competitive landscape`;
    insightType = 'concerning';
  }

  // Generate key findings - focus on insights rather than raw metrics
  const keyFindings = [];

  // Strategic insights about market positioning
  if (certificationRate >= 95) {
    keyFindings.push(`Exceptionally high success rate indicates strong market demand`);
  } else if (certificationRate >= 85) {
    keyFindings.push(`Above-average approval rate suggests solid career prospects`);
  } else if (certificationRate < 70) {
    keyFindings.push(`Competitive approval process requires strong application preparation`);
  }

  // Geographic opportunity insights
  if (topState) {
    if (topState.percentage > 40) {
      keyFindings.push(`Highly concentrated in ${topState.state} - consider location flexibility`);
    } else if (topState.percentage > 20) {
      keyFindings.push(`Strong opportunities in ${topState.state} with regional diversity`);
    } else {
      keyFindings.push(`Geographically distributed opportunities across multiple states`);
    }
  }

  // Compensation competitiveness insights
  if (prevailingWageInsights) {
    if (prevailingWageInsights.averagePremiumPercentage > 10) {
      keyFindings.push(`Salaries consistently exceed government standards by significant margins`);
    } else if (prevailingWageInsights.averagePremiumPercentage > 0) {
      keyFindings.push(`Competitive compensation above prevailing wage requirements`);
    } else {
      keyFindings.push(`Salaries align with government prevailing wage standards`);
    }
  }

  // Market maturity and employer diversity insights
  if (jobData.uniqueEmployers > 50) {
    keyFindings.push(`Diverse employer base provides multiple career pathways`);
  } else if (jobData.uniqueEmployers < 10) {
    keyFindings.push(`Specialized role with focused employer demand`);
  }

  // Full-time opportunity insight (only if not 100% to avoid redundancy)
  if (fullTimePercentage < 95) {
    keyFindings.push(`${fullTimePercentage}% full-time positions - some contract opportunities available`);
  }

  // Salary range insight - only if there's significant variation (reuse salaryRange from above)
  if (salaryRange > 50000) {
    keyFindings.push(`Wide salary range suggests negotiation opportunities based on experience`);
  }

  // Generate market trends
  const marketTrends = [];
  
  if (growthTrend) {
    if (growthTrend.applicationGrowth > 0) {
      marketTrends.push(`Growing demand: ${growthTrend.applicationGrowth}% increase in applications from ${growthTrend.previousYear} to ${growthTrend.latestYear}`);
    } else if (growthTrend.applicationGrowth < -10) {
      marketTrends.push(`Declining demand: ${Math.abs(growthTrend.applicationGrowth)}% decrease in applications year-over-year`);
    }
    
    if (growthTrend.salaryGrowth > 5) {
      marketTrends.push(`Rising compensation: ${growthTrend.salaryGrowth}% salary increase year-over-year`);
    } else if (growthTrend.salaryGrowth < -5) {
      marketTrends.push(`Declining compensation: ${Math.abs(growthTrend.salaryGrowth)}% salary decrease year-over-year`);
    }
  }

  if (geographicDiversity >= 20) {
    marketTrends.push(`Nationwide opportunity: Active hiring across ${geographicDiversity}+ states`);
  } else if (geographicDiversity >= 10) {
    marketTrends.push(`Regional opportunity: Hiring concentrated in ${geographicDiversity} key states`);
  }

  if (jobData.topEmployers && jobData.topEmployers.length > 0) {
    const topEmployer = jobData.topEmployers[0];
    const marketConcentration = Math.round((topEmployer.applications / jobData.totalApplications) * 100);
    if (marketConcentration > 20) {
      marketTrends.push(`Market leader: ${topEmployer.employer} represents ${marketConcentration}% of applications`);
    }
  }

  // Generate recommendations
  const recommendations = [];
  
  if (insightType === 'positive') {
    recommendations.push('Excellent career opportunity - strong approval rates and competitive compensation');
    recommendations.push('Target top-paying employers and high-demand locations for maximum success');
    if (prevailingWageInsights?.averagePremiumPercentage && prevailingWageInsights.averagePremiumPercentage > 0) {
      recommendations.push('Leverage market premium data in salary negotiations');
    }
  } else if (insightType === 'neutral') {
    recommendations.push('Solid career choice - focus on differentiating qualifications and experience');
    recommendations.push('Research specific employers with higher approval rates and compensation');
    recommendations.push('Consider geographic flexibility to access better opportunities');
  } else {
    recommendations.push('Prepare thoroughly - competitive market requires strong application preparation');
    recommendations.push('Consider building additional qualifications or experience');
    recommendations.push('Focus on employers with better track records for this role');
  }

  if (fullTimePercentage > 90) {
    recommendations.push('Excellent for career stability - most positions offer full-time employment');
  }

  if (topState && topState.percentage > 30) {
    recommendations.push(`Consider ${topState.state} for highest job availability and opportunities`);
  }

  return {
    primaryInsight,
    insightType,
    keyFindings,
    marketTrends,
    recommendations,
    certificationRate,
    prevailingWageInsights,
    growthTrend,
  };
};

export const WageInsightSummary: React.FC<WageInsightSummaryProps> = ({
  jobData,
  className = '',
  condensed = false,
}) => {
  const [isExpanded, setIsExpanded] = useState(!condensed);
  const insights = generateJobMarketInsights(jobData);

  // Get condensed quick facts (first 3 strategic insights)
  const quickFacts = insights.keyFindings.slice(0, 3);

  const getInsightStyling = (type: string) => {
    switch (type) {
      case 'positive':
        return {
          bgColor: 'bg-green-50 border-green-200',
          iconColor: 'text-green-600',
          textColor: 'text-green-800',
          icon: CheckCircle2,
        };
      case 'concerning':
        return {
          bgColor: 'bg-red-50 border-red-200',
          iconColor: 'text-red-600',
          textColor: 'text-red-800',
          icon: AlertCircle,
        };
      default:
        return {
          bgColor: 'bg-blue-50 border-blue-200',
          iconColor: 'text-blue-600',
          textColor: 'text-blue-800',
          icon: Target,
        };
    }
  };

  const styling = getInsightStyling(insights.insightType);
  const InsightIcon = styling.icon;

  if (condensed && !isExpanded) {
    // Condensed view - show only key insight and quick facts
    return (
      <Card className={`${className} mb-6`}>
        <CardContent className="p-4">
          {/* Compact header with primary insight */}
          <div className={`p-4 rounded-xl border ${styling.bgColor} mb-4`}>
            <div className="flex items-start gap-3">
              <InsightIcon className={`w-5 h-5 mt-0.5 ${styling.iconColor}`} />
              <div className="flex-1">
                <h4 className={`font-semibold mb-1 ${styling.textColor} text-sm`}>
                  Market Opportunity
                </h4>
                <p className={`text-sm ${styling.textColor}`}>
                  {insights.primaryInsight}
                </p>
              </div>
            </div>
          </div>

          {/* Quick facts - compact grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mb-4">
            {quickFacts.map((fact, index) => (
              <div key={index} className="flex items-start gap-2 p-2 bg-muted/20 rounded-lg">
                <div className="w-1 h-1 rounded-full bg-primary mt-2 flex-shrink-0" />
                <span className="text-xs text-foreground leading-tight">{fact}</span>
              </div>
            ))}
          </div>

          {/* Modern expand button */}
          <div className="flex justify-center">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(true)}
              className="flex items-center gap-2 text-primary hover:text-primary/80 hover:bg-primary/5 transition-all duration-200"
            >
              <Zap className="w-4 h-4" />
              <span className="text-sm font-medium">View Full Market Analysis</span>
              <ChevronDown className="w-4 h-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Full expanded view
  return (
    <Card className={`${className} mb-6`}>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <Lightbulb className="w-5 h-5 text-primary" />
            Market Insights
          </CardTitle>
          {condensed && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(false)}
              className="flex items-center gap-1 text-muted-foreground hover:text-foreground"
            >
              <span className="text-sm">Collapse</span>
              <ChevronUp className="w-4 h-4" />
            </Button>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Primary Insight */}
        <div className={`p-4 rounded-xl border ${styling.bgColor}`}>
          <div className="flex items-start gap-3">
            <InsightIcon className={`w-5 h-5 mt-0.5 ${styling.iconColor}`} />
            <div>
              <h4 className={`font-semibold mb-2 ${styling.textColor}`}>
                Key Finding
              </h4>
              <p className={`text-sm ${styling.textColor}`}>
                {insights.primaryInsight}
              </p>
            </div>
          </div>
        </div>

        {/* Key Findings */}
        <div>
          <h4 className="font-semibold text-foreground mb-3">Strategic Insights</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {insights.keyFindings.map((finding, index) => (
              <div key={index} className="flex items-start gap-2 p-3 bg-muted/30 rounded-lg">
                <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0" />
                <span className="text-sm text-foreground">{finding}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Market Trends */}
        {insights.marketTrends.length > 0 && (
          <div>
            <h4 className="font-semibold text-foreground mb-3 flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              Market Trends
            </h4>
            <div className="space-y-2">
              {insights.marketTrends.map((trend, index) => (
                <div key={index} className="flex items-start gap-2 p-3 bg-gradient-to-r from-primary/5 to-primary/10 rounded-lg border border-primary/10">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0" />
                  <span className="text-sm text-foreground">{trend}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Recommendations */}
        <div>
          <h4 className="font-semibold text-foreground mb-3">Recommendations</h4>
          <div className="space-y-2">
            {insights.recommendations.map((recommendation, index) => (
              <div key={index} className="flex items-start gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                <div className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-2 flex-shrink-0" />
                <span className="text-sm text-amber-800">{recommendation}</span>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default WageInsightSummary;