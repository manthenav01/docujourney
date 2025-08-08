'use client';

import React, { useEffect, useRef } from 'react';
import { generateChartSchema, generateSalaryChartSchema, generateTrendChartSchema, generateDistributionChartSchema, type ChartSchemaConfig } from '@/lib/schema/chartSchema';
import { generateVisualArtworkSchema, type VisualArtworkConfig } from '@/lib/schema/visualArtworkSchema';

interface ChartSchemaWrapperProps {
  children: React.ReactNode;
  chartConfig: Omit<ChartSchemaConfig, 'dateCreated'>;
  visualConfig?: Omit<VisualArtworkConfig, 'name' | 'description'>;
  schemaType?: 'general' | 'salary' | 'trend' | 'distribution';
  className?: string;
}

/**
 * Wrapper component that adds comprehensive schema markup to chart visualizations
 * Completely invisible to users while providing rich SEO data for search engines
 */
export const ChartSchemaWrapper: React.FC<ChartSchemaWrapperProps> = ({
  children,
  chartConfig,
  visualConfig,
  schemaType = 'general',
  className,
}) => {
  const schemaIdRef = useRef<string>(`chart-schema-${Math.random().toString(36).substr(2, 9)}`);
  
  useEffect(() => {
    // Only run on client side
    if (typeof window === 'undefined' || typeof document === 'undefined') {
      return;
    }
    
    // Remove any existing schema for this chart
    const existingSchema = document.querySelector(`script[data-schema-id="${schemaIdRef.current}"]`);
    if (existingSchema) {
      existingSchema.remove();
    }
    
    // Generate appropriate schema based on chart type
    let chartSchema;
    const fullChartConfig = {
      ...chartConfig,
      dateCreated: new Date().toISOString(),
    };
    
    switch (schemaType) {
      case 'salary':
        chartSchema = generateSalaryChartSchema(fullChartConfig);
        break;
      case 'trend':
        chartSchema = generateTrendChartSchema(fullChartConfig);
        break;
      case 'distribution':
        chartSchema = generateDistributionChartSchema(fullChartConfig);
        break;
      default:
        chartSchema = generateChartSchema(fullChartConfig);
    }
    
    // Generate visual artwork schema if config provided
    let visualSchema;
    if (visualConfig) {
      visualSchema = generateVisualArtworkSchema({
        name: chartConfig.title,
        description: chartConfig.description,
        ...visualConfig,
      });
    }
    
    // Create combined schema with multiple types
    const combinedSchema = visualConfig ? [chartSchema, visualSchema] : chartSchema;
    
    // Create and inject schema script
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.setAttribute('data-schema-id', schemaIdRef.current);
    script.setAttribute('data-chart-title', chartConfig.title);
    script.textContent = JSON.stringify(combinedSchema);
    document.head.appendChild(script);
    
    // Cleanup function
    return () => {
      const schema = document.querySelector(`script[data-schema-id="${schemaIdRef.current}"]`);
      if (schema) {
        schema.remove();
      }
    };
  }, [chartConfig, visualConfig, schemaType]);
  
  return (
    <div className={className} data-chart-schema={schemaIdRef.current}>
      {children}
      
      {/* Invisible SEO content for chart accessibility */}
      <div className="sr-only" aria-hidden="true">
        <h3>{chartConfig.title}</h3>
        <p>{chartConfig.description}</p>
        <div>
          <span>Chart Type: {chartConfig.chartType}</span>
          {chartConfig.dataPoints && (
            <span>Data Points: {chartConfig.dataPoints}</span>
          )}
          {chartConfig.categories && (
            <span>Categories: {chartConfig.categories.join(', ')}</span>
          )}
          {chartConfig.metrics && (
            <span>Metrics: {chartConfig.metrics.join(', ')}</span>
          )}
        </div>
      </div>
    </div>
  );
};

/**
 * Pre-configured wrapper for salary charts
 */
export const SalaryChartSchema: React.FC<Omit<ChartSchemaWrapperProps, 'schemaType'>> = (props) => (
  <ChartSchemaWrapper {...props} schemaType="salary" />
);

/**
 * Pre-configured wrapper for trend charts
 */
export const TrendChartSchema: React.FC<Omit<ChartSchemaWrapperProps, 'schemaType'>> = (props) => (
  <ChartSchemaWrapper {...props} schemaType="trend" />
);

/**
 * Pre-configured wrapper for distribution charts
 */
export const DistributionChartSchema: React.FC<Omit<ChartSchemaWrapperProps, 'schemaType'>> = (props) => (
  <ChartSchemaWrapper {...props} schemaType="distribution" />
);

/**
 * Utility hook for adding schema to existing chart components
 */
export const useChartSchema = (config: ChartSchemaWrapperProps) => {
  const schemaIdRef = useRef<string>(`chart-hook-${Math.random().toString(36).substr(2, 9)}`);
  
  useEffect(() => {
    if (typeof window === 'undefined' || typeof document === 'undefined') {
      return;
    }
    
    const existingSchema = document.querySelector(`script[data-schema-id="${schemaIdRef.current}"]`);
    if (existingSchema) {
      existingSchema.remove();
    }
    
    let schema;
    const fullConfig = {
      ...config.chartConfig,
      dateCreated: new Date().toISOString(),
    };
    
    switch (config.schemaType || 'general') {
      case 'salary':
        schema = generateSalaryChartSchema(fullConfig);
        break;
      case 'trend':
        schema = generateTrendChartSchema(fullConfig);
        break;
      case 'distribution':
        schema = generateDistributionChartSchema(fullConfig);
        break;
      default:
        schema = generateChartSchema(fullConfig);
    }
    
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.setAttribute('data-schema-id', schemaIdRef.current);
    script.textContent = JSON.stringify(schema);
    document.head.appendChild(script);
    
    return () => {
      const schemaEl = document.querySelector(`script[data-schema-id="${schemaIdRef.current}"]`);
      if (schemaEl) {
        schemaEl.remove();
      }
    };
  }, [config]);
  
  return schemaIdRef.current;
};