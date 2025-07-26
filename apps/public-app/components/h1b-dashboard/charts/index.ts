// Reusable Chart Components for H1B Dashboard
export { ReusableBarChart } from './ReusableBarChart';
export type { ReusableBarChartProps, BarChartData } from './ReusableBarChart';

export { ReusableProgressChart } from './ReusableProgressChart';
export type { ReusableProgressChartProps, ProgressChartData } from './ReusableProgressChart';

export { ReusableActivityChart } from './ReusableActivityChart';
export type { ReusableActivityChartProps, ActivityChartData } from './ReusableActivityChart';

export { ReusablePieChart } from './ReusablePieChart';
export type { ReusablePieChartProps, PieChartData } from './ReusablePieChart';

// Common chart utilities and types
export interface BaseChartProps {
  title?: string;
  loading?: boolean;
  height?: number;
  colors?: string[];
  animate?: boolean;
  customTooltip?: (props: any) => React.ReactNode;
}

// Standard chart data format
export interface StandardChartData {
  label: string;
  value: number;
  [key: string]: string | number;
}