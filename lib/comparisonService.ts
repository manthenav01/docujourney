// Comparison service for multi-entity analysis
import { BigQuery } from '@google-cloud/bigquery';
import {
  ComparisonEntity,
  ComparisonResult,
  ComparisonMetrics,
  ComparisonEntityWithMetrics,
  TrendData,
  CorrelationData,
  RankingData,
  MarketAnalysis,
  ComparisonFilters,
  ComparisonConfig
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
  async performComparison(config: ComparisonConfig): Promise<ComparisonResult> {
    const { entities, includeCorrelations, includeTrends, includeMarketAnalysis } = config;
    
    // Get metrics for each entity
    const entitiesWithMetrics = await this.getEntitiesWithMetrics(entities, config);
    
    // Calculate rankings
    const rankings = this.calculateRankings(entitiesWithMetrics);
    
    // Get correlations if requested
    const correlations = includeCorrelations 
      ? await this.calculateCorrelations(entities, config)
      : [];
    
    // Get trends if requested
    const trends = includeTrends 
      ? await this.calculateTrends(entities, config)
      : [];
    
    // Perform market analysis if requested
    const marketAnalysis = includeMarketAnalysis 
      ? await this.performMarketAnalysis(entitiesWithMetrics, config)
      : this.getEmptyMarketAnalysis();

    return {
      entities: entitiesWithMetrics,
      correlations,
      trends,
      rankings,
      marketAnalysis,
      filters: this.extractFiltersFromConfig(config),
      generatedAt: new Date()
    };
  }

  /**
   * Get metrics for multiple entities
   */
  private async getEntitiesWithMetrics(
    entities: ComparisonEntity[], 
    config: ComparisonConfig
  ): Promise<ComparisonEntityWithMetrics[]> {
    const results = await Promise.all(
      entities.map(entity => this.getEntityMetrics(entity, config))
    );
    
    // Calculate percentile ranks
    return this.addPercentileRanks(results);
  }

  /**
   * Get metrics for a single entity
   */
  private async getEntityMetrics(
    entity: ComparisonEntity, 
    config: ComparisonConfig
  ): Promise<ComparisonEntityWithMetrics> {
    const whereClause = this.buildEntityWhereClause(entity, config);
    
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
        salaryRange: {
          min: Math.round(data.min_salary || 0),
          max: Math.round(data.max_salary || 0),
          percentile25: Math.round(data.percentile_25 || 0),
          percentile75: Math.round(data.percentile_75 || 0)
        },
        uniqueEmployers: data.unique_employers || 0,
        uniqueJobTitles: data.unique_job_titles || 0,
        topJobTitle: data.top_job_title || 'N/A',
        topState: data.top_state || 'N/A'
      };

      return {
        ...entity,
        metrics,
        rank: {},
        percentileRank: {}
      };
    } catch (error) {
      console.error(`Error getting metrics for entity ${entity.id}:`, error);
      return {
        ...entity,
        metrics: this.getEmptyMetrics(),
        rank: {},
        percentileRank: {}
      };
    }
  }

  /**
   * Build WHERE clause for specific entity
   */
  private buildEntityWhereClause(entity: ComparisonEntity, config: ComparisonConfig): string {
    const conditions: string[] = [];
    
    switch (entity.type) {
      case 'company':
        conditions.push(`LOWER(employer_name) LIKE '%${entity.name.toLowerCase()}%'`);
        break;
      case 'job_title':
        conditions.push(`LOWER(job_title) LIKE '%${entity.name.toLowerCase()}%'`);
        break;
      case 'location':
        conditions.push(`LOWER(worksite_state) = '${entity.name.toLowerCase()}'`);
        break;
      case 'industry':
        // Would need NAICS code mapping for industry
        conditions.push(`naics_code LIKE '${entity.metadata?.naicsPrefix || '54'}%'`);
        break;
    }
    
    // Add timeframe filter
    if (config.timeframe !== 'all') {
      const yearsBack = this.getYearsBack(config.timeframe);
      conditions.push(`
        CASE 
          WHEN EXTRACT(MONTH FROM received_date) >= 10 
          THEN EXTRACT(YEAR FROM received_date) + 1
          ELSE EXTRACT(YEAR FROM received_date)
        END >= ${new Date().getFullYear() - yearsBack}
      `);
    }
    
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
      'medianSalary'
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
      const rankingData: RankingData = {
        metric,
        rankings: sortedEntities.map((entity, index) => ({
          entityId: entity.id,
          rank: index + 1,
          value: this.getMetricValue(entity.metrics, metric),
          percentile: Math.round(((entities.length - index) / entities.length) * 100)
        }))
      };
      
      rankings.push(rankingData);
      
      // Update entity rank data
      sortedEntities.forEach((entity, index) => {
        const originalEntity = entities.find(e => e.id === entity.id);
        if (originalEntity) {
          originalEntity.rank[metric] = index + 1;
          originalEntity.percentileRank[metric] = rankingData.rankings[index].percentile;
        }
      });
    }
    
    return rankings;
  }

  /**
   * Calculate correlations between metrics
   */
  private async calculateCorrelations(
    entities: ComparisonEntity[], 
    config: ComparisonConfig
  ): Promise<CorrelationData[]> {
    // For now, return some common correlations
    // In a full implementation, this would calculate actual correlations from the data
    return [
      {
        metric1: 'totalApplications',
        metric2: 'approvalRate',
        correlation: 0.23,
        significance: 0.05,
        interpretation: 'weak'
      },
      {
        metric1: 'avgSalary',
        metric2: 'approvalRate',
        correlation: 0.67,
        significance: 0.01,
        interpretation: 'moderate'
      }
    ];
  }

  /**
   * Calculate trends over time
   */
  private async calculateTrends(
    entities: ComparisonEntity[], 
    config: ComparisonConfig
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
            periods: results.map((row: any) => ({
              period: row.fiscal_year.toString(),
              value: row.applications || 0,
              date: new Date(row.fiscal_year, 0, 1)
            })),
            trend: this.calculateTrendDirection(results.map((r: any) => r.applications)),
            changeRate: this.calculateChangeRate(results.map((r: any) => r.applications))
          };
          trends.push(applicationsTrend);
          
          // Process salary trend
          const salaryTrend: TrendData = {
            entityId: entity.id,
            metric: 'avgSalary',
            periods: results.map((row: any) => ({
              period: row.fiscal_year.toString(),
              value: Math.round(row.avg_salary || 0),
              date: new Date(row.fiscal_year, 0, 1)
            })),
            trend: this.calculateTrendDirection(results.map((r: any) => r.avg_salary)),
            changeRate: this.calculateChangeRate(results.map((r: any) => r.avg_salary))
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
    config: ComparisonConfig
  ): Promise<MarketAnalysis> {
    const insights = this.generateMarketInsights(entities);
    const benchmarks = await this.calculateMarketBenchmarks(config);
    
    return {
      summary: {
        topPerformer: this.findTopPerformer(entities, 'avgSalary'),
        worstPerformer: this.findWorstPerformer(entities, 'approvalRate'),
        marketLeader: this.findTopPerformer(entities, 'totalApplications'),
        fastestGrowing: entities[0]?.id || 'N/A' // Would need trend analysis
      },
      insights,
      benchmarks
    };
  }

  // Helper methods

  private addPercentileRanks(entities: ComparisonEntityWithMetrics[]): ComparisonEntityWithMetrics[] {
    // This is handled in calculateRankings method
    return entities;
  }

  private getMetricValue(metrics: ComparisonMetrics, metricName: string): number {
    switch (metricName) {
      case 'totalApplications': return metrics.totalApplications;
      case 'approvalRate': return metrics.approvalRate;
      case 'avgSalary': return metrics.avgSalary;
      case 'medianSalary': return metrics.medianSalary;
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
    if (values.length < 2) return 'stable';
    
    const first = values[0];
    const last = values[values.length - 1];
    const change = (last - first) / first;
    
    if (change > 0.1) return 'increasing';
    if (change < -0.1) return 'decreasing';
    return 'stable';
  }

  private calculateChangeRate(values: number[]): number {
    if (values.length < 2) return 0;
    
    const first = values[0];
    const last = values[values.length - 1];
    const periods = values.length - 1;
    
    return ((last - first) / first / periods) * 100;
  }

  private generateMarketInsights(entities: ComparisonEntityWithMetrics[]) {
    const insights = [];
    
    // Find salary outliers
    const avgSalaries = entities.map(e => e.metrics.avgSalary);
    const salaryMean = avgSalaries.reduce((sum, sal) => sum + sal, 0) / avgSalaries.length;
    
    for (const entity of entities) {
      if (entity.metrics.avgSalary > salaryMean * 1.2) {
        insights.push({
          type: 'strength' as const,
          entityId: entity.id,
          title: 'Above Market Salary',
          description: `Offers salaries 20% above market average`,
          impact: 'high' as const,
          confidence: 0.8
        });
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
        totalApplications: 1500
      },
      topQuartile: {
        avgSalary: 160000,
        approvalRate: 95.0,
        totalApplications: 5000
      },
      median: {
        avgSalary: 135000,
        approvalRate: 88.0,
        totalApplications: 2500
      }
    };
  }

  private findTopPerformer(entities: ComparisonEntityWithMetrics[], metric: string): string {
    if (entities.length === 0) return 'N/A';
    
    const top = entities.reduce((best, current) => {
      const currentValue = this.getMetricValue(current.metrics, metric);
      const bestValue = this.getMetricValue(best.metrics, metric);
      return currentValue > bestValue ? current : best;
    });
    
    return top.displayName;
  }

  private findWorstPerformer(entities: ComparisonEntityWithMetrics[], metric: string): string {
    if (entities.length === 0) return 'N/A';
    
    const worst = entities.reduce((worst, current) => {
      const currentValue = this.getMetricValue(current.metrics, metric);
      const worstValue = this.getMetricValue(worst.metrics, metric);
      return currentValue < worstValue ? current : worst;
    });
    
    return worst.displayName;
  }

  private getEmptyMetrics(): ComparisonMetrics {
    return {
      totalApplications: 0,
      certifiedApplications: 0,
      deniedApplications: 0,
      approvalRate: 0,
      avgSalary: 0,
      medianSalary: 0,
      salaryRange: { min: 0, max: 0, percentile25: 0, percentile75: 0 },
      uniqueEmployers: 0,
      uniqueJobTitles: 0,
      topJobTitle: 'N/A',
      topState: 'N/A'
    };
  }

  private getEmptyMarketAnalysis(): MarketAnalysis {
    return {
      summary: {
        topPerformer: 'N/A',
        worstPerformer: 'N/A',
        marketLeader: 'N/A',
        fastestGrowing: 'N/A'
      },
      insights: [],
      benchmarks: {
        industryAverage: {},
        topQuartile: {},
        median: {}
      }
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