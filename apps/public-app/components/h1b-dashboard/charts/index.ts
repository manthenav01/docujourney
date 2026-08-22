'use client';

/**
 * Chart Components Export
 *
 * The Reusable* charts pull in recharts/@nivo (several hundred KB of JS), so
 * they are exported through next/dynamic: they load as separate chunks after
 * hydration instead of sitting in the main bundle. Consumers keep the exact
 * same import paths; each chart shows the standard pulse skeleton while its
 * chunk loads.
 */

import React from 'react';
import dynamic from 'next/dynamic';

const chartSkeleton = () => (
  React.createElement('div', {
    className: 'w-full h-64 bg-muted/20 rounded-lg animate-pulse',
  })
);

export const ReusableAreaChart = dynamic(() => import('./ReusableAreaChart'), {
  ssr: false,
  loading: chartSkeleton,
});
export const ReusablePieChart = dynamic(
  () => import('./ReusablePieChart').then(m => m.ReusablePieChart),
  { ssr: false, loading: chartSkeleton },
);
export const ReusableBarChart = dynamic(
  () => import('./ReusableBarChart').then(m => m.ReusableBarChart),
  { ssr: false, loading: chartSkeleton },
);
export const ReusableProgressChart = dynamic(
  () => import('./ReusableProgressChart').then(m => m.ReusableProgressChart),
  { ssr: false, loading: chartSkeleton },
);
export const ReusableSalaryDistribution = dynamic(
  () => import('./ReusableSalaryDistribution').then(m => m.ReusableSalaryDistribution),
  { ssr: false, loading: chartSkeleton },
);

export type { PieChartData } from './ReusablePieChart';
export type { BarChartData } from './ReusableBarChart';
export type { ProgressChartData } from './ReusableProgressChart';
export type { SalaryDistributionData, ReusableSalaryDistributionProps } from './ReusableSalaryDistribution';
export type { YearlyTrend } from '../MarketTrendsCard';

// Non-chart cards stay as regular exports — they are lightweight.
export { MobileOptimizedChart } from './MobileOptimizedChart';
export { MarketTrendsCard } from '../MarketTrendsCard';
export { TopJobTitlesCard } from '../TopJobTitlesCard';
export { TopEmployersCard } from '../TopEmployersCard';
export { TopJobCategoriesCard } from '../TopJobCategoriesCard';
