# H1B Dashboard Reusable Chart Components

This directory contains reusable @nivo chart components designed for the H1B Dashboard. These components provide a consistent, performant, and maintainable solution for data visualization across the dashboard.

## Overview

The refactored chart system addresses several key issues from the previous implementation:
- **Code Duplication**: Eliminates duplicate chart logic across components
- **Inconsistent Styling**: Provides unified theming and styling
- **Performance**: Optimized with React.memo and memoized callbacks
- **Maintainability**: Centralized chart configuration and reusable interfaces

## Components

### ReusableBarChart
**File**: `ReusableBarChart.tsx`
**Purpose**: Horizontal and vertical bar charts for quantitative data

**Key Features**:
- Supports both horizontal and vertical orientations
- Grouped and stacked bar modes
- Customizable colors, margins, and formatting
- Built-in tooltip system with extensible customization
- Responsive design with loading states

**Usage Example**:
```tsx
<ReusableBarChart
  data={chartData}
  keys={['value']}
  indexBy="category"
  title="Application Distribution"
  height={400}
  colors={['#3b82f6', '#059669']}
  axisBottomLegend="Categories"
  axisLeftLegend="Count"
  formatValue={(value) => value.toLocaleString()}
/>
```

### ReusableProgressChart
**File**: `ReusableProgressChart.tsx`
**Purpose**: Progress bars and comparative data visualization

**Key Features**:
- Horizontal progress bars with percentage indicators
- Vertical bar chart mode available
- Automatic percentage calculation
- Custom color support per item
- Responsive layout with truncation handling

**Usage Example**:
```tsx
<ReusableProgressChart
  data={progressData}
  title="Geographic Distribution"
  height={300}
  showPercentage={true}
  showValues={true}
  formatValue={(value) => value.toLocaleString()}
/>
```

### ReusableActivityChart
**File**: `ReusableActivityChart.tsx`
**Purpose**: Time-series and activity data visualization

**Key Features**:
- Compact mode for timeline displays
- Full chart mode with axis labels
- Configurable time period formatting
- Activity trend visualization
- Mobile-responsive bar sizing

**Usage Example**:
```tsx
<ReusableActivityChart
  data={activityData}
  title="Recent Application Activity"
  height={200}
  compact={true}
  formatPeriod={(period) => period.split(' ')[0]}
  formatValue={(value) => value.toLocaleString()}
/>
```

### ReusablePieChart
**File**: `ReusablePieChart.tsx`
**Purpose**: Pie charts for categorical data distribution

**Key Features**:
- Configurable inner radius (donut charts)
- Interactive legend with hover states
- Center content display
- Data slicing and "Others" grouping
- Custom tooltip system

**Usage Example**:
```tsx
<ReusablePieChart
  data={pieData}
  title="Industry Distribution"
  height={400}
  innerRadius={0.5}
  maxSlices={5}
  showLegend={true}
  legendPosition="bottom"
/>
```

## Standardized Interfaces

### Common Props
All chart components share these base properties:
```tsx
interface BaseChartProps {
  title?: string;
  loading?: boolean;
  height?: number;
  colors?: string[];
  animate?: boolean;
  customTooltip?: (props: any) => React.ReactNode;
}
```

### Data Formats
Charts expect standardized data structures:
```tsx
// Bar Chart Data
interface BarChartData {
  [key: string]: string | number;
}

// Progress Chart Data
interface ProgressChartData {
  label: string;
  value: number;
  percentage?: number;
  color?: string;
}

// Activity Chart Data
interface ActivityChartData {
  period: string;
  value: number;
}

// Pie Chart Data
interface PieChartData {
  id: string;
  label?: string;
  value: number;
  color?: string;
}
```

## Migration Summary

### Refactored Components

#### CompanyDashboard.tsx
**Before**: Manual HTML/CSS progress bars and activity bars
**After**: ReusableProgressChart and ReusableActivityChart
**Benefits**: 
- Consistent theming with rest of dashboard
- Interactive tooltips
- Better responsive behavior
- Reduced code complexity by ~200 lines

#### SalaryDistributionChart.tsx
**Before**: Custom @nivo ResponsiveBar implementation
**After**: ReusableBarChart with salary-specific customizations
**Benefits**:
- Reusable component with consistent API
- Maintains all original functionality
- Better error handling and loading states

#### HighestSalaryByStateChart.tsx
**Before**: Custom @nivo ResponsiveBar with toggle functionality
**After**: ReusableBarChart with preserved toggle behavior
**Benefits**:
- Simplified component logic
- Consistent styling and interactions
- Better maintainability

#### IndustryDistributionChart.tsx
**Before**: Custom @nivo ResponsivePie implementation
**After**: ReusablePieChart with industry-specific tooltips
**Benefits**:
- Consistent pie chart behavior across dashboard
- Better legend handling
- Improved accessibility

#### TrendChart.tsx
**Before**: Custom SVG charts with manual rendering
**After**: ReusableBarChart for trend visualization
**Benefits**:
- Professional @nivo charts instead of basic SVG
- Better animations and interactions
- Consistent with dashboard theme

#### SalaryChart.tsx
**Before**: Custom SVG bar charts
**After**: ReusableBarChart components
**Benefits**:
- Professional chart appearance
- Better data handling and formatting
- Consistent tooltip system

### Performance Improvements

1. **Memoization**: All components use React.memo and useMemo for optimal re-rendering
2. **Callback Optimization**: Memoized event handlers and tooltip components
3. **Bundle Size**: Reduced duplicate @nivo imports and chart logic
4. **Theme Caching**: Centralized theme creation to prevent unnecessary recalculation

### Consistency Improvements

1. **Color System**: All charts use the centralized `chartColors.ts` system
2. **Typography**: Consistent font families, sizes, and weights
3. **Spacing**: Standardized margins, padding, and component spacing
4. **Animations**: Unified animation timing and easing functions
5. **Tooltips**: Consistent tooltip styling and information display

## Best Practices

### Using the Charts

1. **Always provide loading states**: Set `loading={true}` when data is being fetched
2. **Use appropriate colors**: Leverage the centralized color system
3. **Format data consistently**: Use the provided formatting functions
4. **Handle empty states**: Charts gracefully handle empty or invalid data
5. **Optimize for mobile**: All charts are responsive by default

### Extending the Charts

1. **Custom tooltips**: Use the `customTooltip` prop for specialized information
2. **Color customization**: Pass custom color arrays for brand-specific theming
3. **Data transformation**: Transform your data to match the expected interfaces
4. **Height adjustment**: Use appropriate heights for different container sizes

### Performance Considerations

1. **Data memoization**: Always wrap data processing in `useMemo`
2. **Callback stability**: Use `useCallback` for event handlers
3. **Lazy loading**: Consider code splitting for dashboard sections
4. **Update optimization**: Use React.memo for components that render frequently

## File Structure

```
components/h1b-dashboard/charts/
├── ReusableBarChart.tsx        # Bar chart component
├── ReusableProgressChart.tsx   # Progress bar component  
├── ReusableActivityChart.tsx   # Activity timeline component
├── ReusablePieChart.tsx       # Pie/donut chart component
├── index.ts                   # Exports and type definitions
└── README.md                  # This documentation
```

## Import Usage

```tsx
// Import individual components
import { ReusableBarChart, ReusableProgressChart } from './charts';

// Import types
import type { BarChartData, ProgressChartData } from './charts';

// Import from index for clean imports
import { 
  ReusableBarChart,
  ReusableProgressChart,
  ReusableActivityChart,
  ReusablePieChart
} from './charts';
```

This refactored chart system provides a solid foundation for consistent, maintainable, and performant data visualization across the H1B Dashboard.