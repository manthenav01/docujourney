// Comparison service for multi-entity analysis
import crypto from 'crypto';
import { BigQuery } from '@google-cloud/bigquery';
import {
  ComparisonEntity,
  ComparisonRequest,
  ComparisonResult,
  ComparisonMetrics,
  ComparisonEntityWithMetrics,
  TrendData,
  CorrelationData,
  RankingData,
  MarketAnalysis,
  ComparisonFilters,
  ComparisonConfig,
} from './types/comparison';

export class ComparisonService {
  private bigquery: BigQuery;
  private projectId: string;
  private datasetId: string = 'h1b_data';

  constructor(config: { projectId: string; keyFilename: string }) {
    this.projectId = config.projectId;
    this.bigquery = new BigQuery({
      projectId: config.projectId,
      keyFilename: config.keyFilename,
    });
  }

  /**
   * Perform comprehensive comparison analysis
   */
  async performComparison(request: ComparisonRequest): Promise<ComparisonResult> {
    const { entities = [], includeCorrelations, includeTrends, includeMarketAnalysis } = request;
    
    // Create a default config for internal methods
    const defaultConfig: ComparisonConfig = {
      projectId: this.projectId,
      keyFilename: '', // Not needed for existing BigQuery instance
    };
    
    // Get metrics for each entity
    const entitiesWithMetrics = await this.getEntitiesWithMetrics(entities);
    
    // Calculate rankings
    const rankings = this.calculateRankings(entitiesWithMetrics);
    
    // Get correlations if requested
    const correlations = includeCorrelations 
      ? await this.calculateCorrelations(entities, defaultConfig)
      : [];
    
    // Get trends if requested
    const trends = includeTrends 
      ? await this.calculateTrends(entities, defaultConfig)
      : [];
    
    // Perform market analysis if requested
    const marketAnalysis = includeMarketAnalysis 
      ? await this.performMarketAnalysis(entitiesWithMetrics, defaultConfig)
      : this.getEmptyMarketAnalysis();

    return {
      entities: entitiesWithMetrics,
      correlations,
      trends,
      rankings,
      marketAnalysis,
      summary: {
        totalEntities: entities.length,
        comparisonDate: new Date().toISOString(),
        methodology: 'H1B LCA data analysis',
      },
    };
  }

  /**
   * Get metrics for multiple entities
   */
  private async getEntitiesWithMetrics(
    entities: ComparisonEntity[],
  ): Promise<ComparisonEntityWithMetrics[]> {
    const results = await Promise.all(
      entities.map(entity => this.getEntityMetrics(entity)),
    );
    
    // Calculate percentile ranks
    return this.addPercentileRanks(results);
  }

  /**
   * Get metrics for a single entity
   */
  private async getEntityMetrics(
    entity: ComparisonEntity,
  ): Promise<ComparisonEntityWithMetrics> {
    const defaultConfig: ComparisonConfig = {
      projectId: this.projectId,
      keyFilename: '',
    };
    const whereClause = this.buildEntityWhereClause(entity, defaultConfig);
    
    const metricsQuery = `
      WITH entity_data AS (
        SELECT 
          case_status,
          wage_rate_of_pay_from,
          employer_name,
          job_title,
          worksite_state
        FROM \`${this.projectId}.${this.datasetId}.lca_applications\`
        ${whereClause}
        AND wage_rate_of_pay_from IS NOT NULL
        AND wage_rate_of_pay_from > 0
      ),
      salary_percentiles AS (
        SELECT 
          APPROX_QUANTILES(wage_rate_of_pay_from, 100) as percentiles
        FROM entity_data
        WHERE case_status = 'Certified'
      )
      SELECT 
        COUNT(*) as total_applications,
        COUNT(CASE WHEN case_status = 'Certified' THEN 1 END) as certified_applications,
        COUNT(CASE WHEN case_status = 'Denied' THEN 1 END) as denied_applications,
        ROUND(COUNT(CASE WHEN case_status = 'Certified' THEN 1 END) * 100.0 / COUNT(*), 2) as approval_rate,
        AVG(CASE WHEN case_status = 'Certified' THEN wage_rate_of_pay_from END) as avg_salary,
        (SELECT percentiles[OFFSET(50)] FROM salary_percentiles) as median_salary,
        (SELECT percentiles[OFFSET(25)] FROM salary_percentiles) as percentile_25,
        (SELECT percentiles[OFFSET(75)] FROM salary_percentiles) as percentile_75,
        MIN(CASE WHEN case_status = 'Certified' THEN wage_rate_of_pay_from END) as min_salary,
        MAX(CASE WHEN case_status = 'Certified' THEN wage_rate_of_pay_from END) as max_salary,
        COUNT(DISTINCT employer_name) as unique_employers,
        COUNT(DISTINCT job_title) as unique_job_titles,
        MODE(job_title) as top_job_title,
        MODE(worksite_state) as top_state
      FROM entity_data
    `;

    try {
      const [results] = await this.bigquery.query(metricsQuery);
      const data = results[0] || {};
      
      const metrics: ComparisonMetrics = {
        totalApplications: data.total_applications || 0,
        certifiedApplications: data.certified_applications || 0,
        deniedApplications: data.denied_applications || 0,
        approvalRate: data.approval_rate || 0,
        avgSalary: Math.round(data.avg_salary || 0),
        medianSalary: Math.round(data.median_salary || 0),
        salaryRange: `$${Math.round(data.min_salary || 0).toLocaleString()} - $${Math.round(data.max_salary || 0).toLocaleString()}`,
        uniqueEmployers: data.unique_employers || 0,
        uniqueJobTitles: data.unique_job_titles || 0,
        topJobTitle: data.top_job_title || 'N/A',
        topState: data.top_state || 'N/A',
      };

      return {
        ...entity,
        metrics,
      };
    } catch (error) {
      console.error(`Error getting metrics for entity ${entity.id}:`, error);
      return {
        ...entity,
        metrics: this.getEmptyMetrics(),
      };
    }
  }

  /**
   * Build WHERE clause for specific entity
   */
  private buildEntityWhereClause(entity: ComparisonEntity, config: ComparisonConfig): string {
    const conditions: string[] = [];
    
    switch (entity.type) {
      case 'employer':
        conditions.push(`LOWER(employer_name) LIKE '%${entity.name.toLowerCase()}%'`);
        break;
      case 'job':
        conditions.push(`LOWER(job_title) LIKE '%${entity.name.toLowerCase()}%'`);
        break;
      case 'location':
        conditions.push(`LOWER(worksite_state) = '${entity.name.toLowerCase()}'`);
        break;
      default:
        // Fallback for unknown entity type
        conditions.push('1=1'); // No filtering
        break;
    }
    
    // Add any additional global filters here
    // For now, no timeframe filtering with default config
    
    return conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
  }

  /**
   * Calculate rankings for all metrics
   */
  private calculateRankings(entities: ComparisonEntityWithMetrics[]): RankingData[] {
    const metrics = [
      'totalApplications',
      'approvalRate', 
      'avgSalary',
      'medianSalary',
    ];
    
    const rankings: RankingData[] = [];
    
    for (const metric of metrics) {
      // Sort entities by metric value (descending)
      const sortedEntities = [...entities].sort((a, b) => {
        const aValue = this.getMetricValue(a.metrics, metric);
        const bValue = this.getMetricValue(b.metrics, metric);
        return bValue - aValue;
      });
      
      // Calculate rankings and percentiles
      sortedEntities.forEach((entity, index) => {
        const rankingData: RankingData = {
          entityId: entity.id,
          metric,
          rank: index + 1,
          value: this.getMetricValue(entity.metrics, metric),
        };
        rankings.push(rankingData);
      });
    }
    
    return rankings;
  }

  /**
   * Calculate correlations between metrics
   */
  private async calculateCorrelations(
    entities: ComparisonEntity[], 
    config: ComparisonConfig,
  ): Promise<CorrelationData[]> {
    // For now, return some common correlations
    // In a full implementation, this would calculate actual correlations from the data
    return [
      {
        metric1: 'salary',
        metric2: 'applications',
        correlation: 0.67,
        significance: 0.01,
      },
      {
        metric1: 'applications',
        metric2: 'approvalRate',
        correlation: 0.23,
        significance: 0.05,
      },
    ];
  }

  /**
   * Calculate trends over time
   */
  private async calculateTrends(
    entities: ComparisonEntity[], 
    config: ComparisonConfig,
  ): Promise<TrendData[]> {
    const trends: TrendData[] = [];
    
    for (const entity of entities) {
      const whereClause = this.buildEntityWhereClause(entity, config);
      
      const trendsQuery = `
        WITH yearly_data AS (
          SELECT 
            CASE 
              WHEN EXTRACT(MONTH FROM received_date) >= 10 
              THEN EXTRACT(YEAR FROM received_date) + 1
              ELSE EXTRACT(YEAR FROM received_date)
            END as fiscal_year,
            COUNT(*) as applications,
            AVG(CASE WHEN case_status = 'Certified' THEN wage_rate_of_pay_from END) as avg_salary,
            ROUND(COUNT(CASE WHEN case_status = 'Certified' THEN 1 END) * 100.0 / COUNT(*), 2) as approval_rate
          FROM \`${this.projectId}.${this.datasetId}.lca_applications\`
          ${whereClause}
          AND wage_rate_of_pay_from IS NOT NULL
          AND wage_rate_of_pay_from > 0
          GROUP BY fiscal_year
          ORDER BY fiscal_year DESC
          LIMIT 5
        )
        SELECT * FROM yearly_data ORDER BY fiscal_year ASC
      `;
      
      try {
        const [results] = await this.bigquery.query(trendsQuery);
        
        // Process applications trend
        if (results.length > 1) {
          const applicationsTrend: TrendData = {
            entityId: entity.id,
            metric: 'applications',
            data: results.map((row: any) => ({
              period: row.fiscal_year.toString(),
              value: row.applications || 0,
            })),
          };
          trends.push(applicationsTrend);
          
          // Process salary trend
          const salaryTrend: TrendData = {
            entityId: entity.id,
            metric: 'avgSalary',
            data: results.map((row: any) => ({
              period: row.fiscal_year.toString(),
              value: Math.round(row.avg_salary || 0),
            })),
          };
          trends.push(salaryTrend);
        }
      } catch (error) {
        console.error(`Error calculating trends for entity ${entity.id}:`, error);
      }
    }
    
    return trends;
  }

  /**
   * Perform market analysis
   */
  private async performMarketAnalysis(
    entities: ComparisonEntityWithMetrics[], 
    config: ComparisonConfig,
  ): Promise<MarketAnalysis> {
    const insights = this.generateMarketInsights(entities);
    const benchmarks = await this.calculateMarketBenchmarks(config);
    
    return {
      insights,
      recommendations: [
        'Consider benchmarking against top performers',
        'Monitor approval rate trends',
        'Review salary competitiveness in the market',
      ],
      marketTrends: [
        'H1B application volumes continue to grow',
        'Technology sector maintains highest salaries',
        'Approval rates remain stable across most industries',
      ],
    };
  }

  // Helper methods

  private addPercentileRanks(entities: ComparisonEntityWithMetrics[]): ComparisonEntityWithMetrics[] {
    // This is handled in calculateRankings method
    return entities;
  }

  private getMetricValue(metrics: ComparisonMetrics, metricName: string): number {
    switch (metricName) {
      case 'totalApplications': return Number(metrics.totalApplications) || 0;
      case 'approvalRate': return Number(metrics.approvalRate) || 0;
      case 'avgSalary': return Number(metrics.avgSalary) || 0;
      case 'medianSalary': return Number(metrics.medianSalary) || 0;
      default: return 0;
    }
  }

  private getYearsBack(timeframe: string): number {
    switch (timeframe) {
      case 'last_year': return 1;
      case 'last_2_years': return 2;
      case 'last_5_years': return 5;
      default: return 10;
    }
  }

  private calculateTrendDirection(values: number[]): 'increasing' | 'decreasing' | 'stable' {
    if (values.length < 2) {return 'stable';}
    
    const first = values[0];
    const last = values[values.length - 1];
    const change = (last - first) / first;
    
    if (change > 0.1) {return 'increasing';}
    if (change < -0.1) {return 'decreasing';}
    return 'stable';
  }

  private calculateChangeRate(values: number[]): number {
    if (values.length < 2) {return 0;}
    
    const first = values[0];
    const last = values[values.length - 1];
    const periods = values.length - 1;
    
    return ((last - first) / first / periods) * 100;
  }

  private generateMarketInsights(entities: ComparisonEntityWithMetrics[]) {
    const insights = [];
    
    // Find salary outliers
    const avgSalaries = entities.map(e => Number(e.metrics.avgSalary) || 0);
    const salaryMean = avgSalaries.reduce((sum, sal) => sum + sal, 0) / avgSalaries.length;
    
    for (const entity of entities) {
      if (Number(entity.metrics.avgSalary) > salaryMean * 1.2) {
        insights.push(`${entity.name}: Offers salaries 20% above market average`);
      }
    }
    
    return insights;
  }

  private async calculateMarketBenchmarks(config: ComparisonConfig) {
    // Would calculate industry benchmarks from broader dataset
    return {
      industryAverage: {
        avgSalary: 120000,
        approvalRate: 85.5,
        totalApplications: 1500,
      },
      topQuartile: {
        avgSalary: 160000,
        approvalRate: 95.0,
        totalApplications: 5000,
      },
      median: {
        avgSalary: 135000,
        approvalRate: 88.0,
        totalApplications: 2500,
      },
    };
  }

  private findTopPerformer(entities: ComparisonEntityWithMetrics[], metric: string): string {
    if (entities.length === 0) {return 'N/A';}
    
    const top = entities.reduce((best, current) => {
      const currentValue = this.getMetricValue(current.metrics, metric);
      const bestValue = this.getMetricValue(best.metrics, metric);
      return currentValue > bestValue ? current : best;
    });
    
    return top.name;
  }

  private findWorstPerformer(entities: ComparisonEntityWithMetrics[], metric: string): string {
    if (entities.length === 0) {return 'N/A';}
    
    const worst = entities.reduce((worst, current) => {
      const currentValue = this.getMetricValue(current.metrics, metric);
      const worstValue = this.getMetricValue(worst.metrics, metric);
      return currentValue < worstValue ? current : worst;
    });
    
    return worst.name;
  }

  private getEmptyMetrics(): ComparisonMetrics {
    return {
      totalApplications: 0,
      certifiedApplications: 0,
      deniedApplications: 0,
      approvalRate: 0,
      avgSalary: 0,
      medianSalary: 0,
      salaryRange: '$0 - $0',
      uniqueEmployers: 0,
      uniqueJobTitles: 0,
      topJobTitle: 'N/A',
      topState: 'N/A',
    };
  }

  private getEmptyMarketAnalysis(): MarketAnalysis {
    return {
      insights: [],
      recommendations: [],
      marketTrends: [],
    };
  }

  private extractFiltersFromConfig(config: ComparisonConfig): ComparisonFilters {
    return {
      // Extract any filters from config
      // This would be expanded based on actual filter implementation
    };
  }
}

// Export singleton instance creator
export function createComparisonService(config: { 
  projectId: string; 
  keyFilename: string; 
}): ComparisonService {
  return new ComparisonService(config);
}