/**
 * Chart Components Export
 * Centralized exports for all dashboard chart components
 */

export { default as ReusableAreaChart } from './ReusableAreaChart';
export { ReusablePieChart, type PieChartData } from './ReusablePieChart';
export { ReusableBarChart, type BarChartData } from './ReusableBarChart';
export { ReusableActivityChart, type ActivityChartData } from './ReusableActivityChart';
export { ReusableProgressChart, type ProgressChartData } from './ReusableProgressChart';
export { ReusableSalaryDistribution, type SalaryDistributionData, type ReusableSalaryDistributionProps } from './ReusableSalaryDistribution';
export { MobileOptimizedChart } from './MobileOptimizedChart';
export { MarketTrendsCard, type YearlyTrend } from '../MarketTrendsCard';
export { TopJobTitlesCard } from '../TopJobTitlesCard';
export { TopEmployersCard } from '../TopEmployersCard';
export { TopJobCategoriesCard } from '../TopJobCategoriesCard';

// Additional chart types can be exported here as they're created
// export { default as LineChart } from './LineChart';
// export { default as BarChart } from './BarChart';