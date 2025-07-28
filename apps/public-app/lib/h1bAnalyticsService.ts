/**
 * H1B Analytics Service - Business logic for calculating performance metrics and insights
 * Extracted from components to follow service layer pattern
 */

import { 
  H1BAttorneyAnalysis, 
  H1BCompanyAnalysis, 
  H1BJobAnalysis, 
  H1BCityAnalysis,
  H1BAggregatedData, 
} from './types';

export interface AttorneyPerformanceScore {
  overall: number;
  certificationRateScore: number;
  volumeScore: number;
  salaryScore: number;
  experienceScore: number;
  description: string;
}

export interface CompanyInsights {
  growth: 'growing' | 'stable' | 'declining';
  salaryCompetitiveness: 'high' | 'medium' | 'low';
  diversity: 'high' | 'medium' | 'low';
  risk: 'low' | 'medium' | 'high';
}

export interface JobMarketInsights {
  demand: 'high' | 'medium' | 'low';
  salaryTrend: 'increasing' | 'stable' | 'decreasing';
  competition: 'high' | 'medium' | 'low';
  outlook: 'excellent' | 'good' | 'fair' | 'poor';
}

export class H1BAnalyticsService {
  /**
   * Calculate comprehensive attorney performance score
   */
  calculateAttorneyPerformanceScore(attorney: H1BAttorneyAnalysis): AttorneyPerformanceScore {
    // Certification Rate Score (40% weight)
    const certificationRateScore = Math.min(attorney.certificationRate / 90 * 100, 100);
    
    // Volume Score (25% weight) - logarithmic scale
    const volumeScore = Math.min(Math.log10(attorney.totalApplications + 1) / Math.log10(1000) * 100, 100);
    
    // Salary Score (20% weight) - based on market averages
    const marketAvgSalary = 120000; // Industry benchmark
    const salaryScore = Math.min(attorney.avgSalary / marketAvgSalary * 100, 150);
    
    // Experience Score (15% weight) - based on years of data
    const yearsOfData = attorney.yearlyTrends.length;
    const experienceScore = Math.min(yearsOfData / 5 * 100, 100);
    
    // Calculate weighted overall score
    const overall = Math.round(
      (certificationRateScore * 0.4) +
      (volumeScore * 0.25) +
      (salaryScore * 0.2) +
      (experienceScore * 0.15),
    );
    
    // Generate description
    let description = '';
    if (overall >= 90) {
      description = 'Exceptional attorney with outstanding performance across all metrics';
    } else if (overall >= 80) {
      description = 'Highly skilled attorney with strong track record';
    } else if (overall >= 70) {
      description = 'Experienced attorney with solid performance';
    } else if (overall >= 60) {
      description = 'Competent attorney with room for improvement';
    } else {
      description = 'Consider other attorneys for better outcomes';
    }
    
    return {
      overall: Math.min(overall, 100),
      certificationRateScore: Math.round(certificationRateScore),
      volumeScore: Math.round(volumeScore),
      salaryScore: Math.round(salaryScore),
      experienceScore: Math.round(experienceScore),
      description,
    };
  }

  /**
   * Analyze company hiring patterns and generate insights
   */
  analyzeCompanyInsights(company: H1BCompanyAnalysis): CompanyInsights {
    // Determine growth trend
    let growth: CompanyInsights['growth'] = 'stable';
    if (company.yearlyTrends.length >= 2) {
      const recent = company.yearlyTrends[0];
      const previous = company.yearlyTrends[1];
      const growthRate = (recent.applications - previous.applications) / previous.applications;
      
      if (growthRate > 0.2) {growth = 'growing';}
      else if (growthRate < -0.2) {growth = 'declining';}
    }
    
    // Salary competitiveness (compared to market average)
    const marketAvg = 120000;
    const salaryRatio = company.avgSalary / marketAvg;
    const salaryCompetitiveness: CompanyInsights['salaryCompetitiveness'] = 
      salaryRatio > 1.2 ? 'high' : salaryRatio > 0.9 ? 'medium' : 'low';
    
    // Geographic diversity
    const diversity: CompanyInsights['diversity'] = 
      company.topStates.length >= 5 ? 'high' : 
      company.topStates.length >= 3 ? 'medium' : 'low';
    
    // Risk assessment based on various factors
    const certificationRate = company.certifiedApplications / company.totalApplications * 100;
    const risk: CompanyInsights['risk'] = 
      certificationRate >= 85 && growth !== 'declining' ? 'low' :
      certificationRate >= 70 ? 'medium' : 'high';
    
    return {
      growth,
      salaryCompetitiveness,
      diversity,
      risk,
    };
  }

  /**
   * Analyze job market conditions and trends
   */
  analyzeJobMarketInsights(job: H1BJobAnalysis): JobMarketInsights {
    // Demand based on total applications
    const demand: JobMarketInsights['demand'] = 
      job.totalApplications > 1000 ? 'high' :
      job.totalApplications > 500 ? 'medium' : 'low';
    
    // Salary trend analysis
    let salaryTrend: JobMarketInsights['salaryTrend'] = 'stable';
    if (job.yearlyTrends.length >= 2) {
      const recent = job.yearlyTrends[0];
      const previous = job.yearlyTrends[1];
      const trendRate = (recent.avgSalary - previous.avgSalary) / previous.avgSalary;
      
      if (trendRate > 0.05) {salaryTrend = 'increasing';}
      else if (trendRate < -0.05) {salaryTrend = 'decreasing';}
    }
    
    // Competition level (inverse of certification rate)
    const certificationRate = job.certifiedApplications / job.totalApplications * 100;
    const competition: JobMarketInsights['competition'] = 
      certificationRate < 70 ? 'high' :
      certificationRate < 85 ? 'medium' : 'low';
    
    // Overall outlook
    const outlook: JobMarketInsights['outlook'] = 
      demand === 'high' && salaryTrend === 'increasing' && competition === 'low' ? 'excellent' :
      demand === 'high' && competition === 'low' ? 'good' :
      demand === 'medium' && salaryTrend !== 'decreasing' ? 'good' :
      competition === 'high' ? 'poor' : 'fair';
    
    return {
      demand,
      salaryTrend,
      competition,
      outlook,
    };
  }

  /**
   * Calculate salary percentiles for a given amount
   */
  calculateSalaryPercentile(salary: number, data: H1BAggregatedData): number {
    // Use salary distribution to estimate percentile
    let totalBelow = 0;
    let totalCount = 0;
    
    for (const range of data.salaryDistribution) {
      totalCount += range.count;
      
      // Extract range bounds
      const rangeMatch = range.range.match(/\$?(\d+)K?(?:\s*-\s*\$?(\d+)K?)?/);
      if (!rangeMatch) {continue;}
      
      const lowerBound = parseInt(rangeMatch[1]) * (range.range.includes('K') ? 1000 : 1);
      const upperBound = rangeMatch[2] ? 
        parseInt(rangeMatch[2]) * (range.range.includes('K') ? 1000 : 1) : 
        lowerBound;
      
      if (salary >= upperBound) {
        totalBelow += range.count;
      } else if (salary >= lowerBound) {
        // Interpolate within the range
        const positionInRange = (salary - lowerBound) / (upperBound - lowerBound);
        totalBelow += range.count * positionInRange;
        break;
      }
    }
    
    return totalCount > 0 ? Math.round((totalBelow / totalCount) * 100) : 50;
  }

  /**
   * Generate smart recommendations based on attorney data
   */
  generateAttorneyRecommendations(attorney: H1BAttorneyAnalysis): string[] {
    const recommendations: string[] = [];
    const score = this.calculateAttorneyPerformanceScore(attorney);
    
    if (attorney.certificationRate < 85) {
      recommendations.push('Consider attorneys with higher certification rates for better success odds');
    }
    
    if (attorney.totalApplications < 50) {
      recommendations.push('This attorney has limited H1B experience - consider more experienced alternatives');
    }
    
    if (attorney.avgSalary < 100000) {
      recommendations.push('Average salary outcomes are below market rate - negotiate compensation carefully');
    }
    
    if (attorney.topStates.length === 1) {
      recommendations.push('Limited geographic experience - verify expertise in your target location');
    }
    
    if (score.overall >= 85) {
      recommendations.push('Excellent choice - this attorney demonstrates strong performance across key metrics');
    }
    
    if (attorney.yearlyTrends.length >= 3) {
      const trend = attorney.yearlyTrends[0].applications - attorney.yearlyTrends[2].applications;
      if (trend > 0) {
        recommendations.push('Growing practice with increasing caseload - sign of success and demand');
      }
    }
    
    return recommendations;
  }

  /**
   * Format numbers with appropriate units and precision
   */
  formatMetric(value: number, type: 'currency' | 'percentage' | 'number'): string {
    switch (type) {
      case 'currency':
        return new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: 'USD',
          minimumFractionDigits: 0,
          maximumFractionDigits: 0,
        }).format(value);
      
      case 'percentage':
        return `${value.toFixed(1)}%`;
      
      case 'number':
        return new Intl.NumberFormat('en-US').format(value);
      
      default:
        return value.toString();
    }
  }

  /**
   * Determine risk level for H1B applications based on various factors
   */
  assessApplicationRisk(data: {
    employer?: string;
    jobTitle?: string;
    location?: string;
    salary?: number;
    attorney?: H1BAttorneyAnalysis;
  }): { level: 'low' | 'medium' | 'high'; factors: string[] } {
    const riskFactors: string[] = [];
    let riskScore = 0;
    
    // Attorney performance
    if (data.attorney) {
      if (data.attorney.certificationRate < 75) {
        riskFactors.push('Attorney has below-average certification rate');
        riskScore += 2;
      } else if (data.attorney.certificationRate < 85) {
        riskScore += 1;
      }
      
      if (data.attorney.totalApplications < 25) {
        riskFactors.push('Attorney has limited H1B experience');
        riskScore += 1;
      }
    }
    
    // Salary considerations
    if (data.salary) {
      if (data.salary < 60000) {
        riskFactors.push('Salary below prevailing wage thresholds');
        riskScore += 3;
      } else if (data.salary < 80000) {
        riskFactors.push('Salary in lower range - ensure prevailing wage compliance');
        riskScore += 1;
      }
    }
    
    const level: 'low' | 'medium' | 'high' = 
      riskScore >= 4 ? 'high' : riskScore >= 2 ? 'medium' : 'low';
    
    return { level, factors: riskFactors };
  }
}

// Export singleton instance
export const h1bAnalyticsService = new H1BAnalyticsService();