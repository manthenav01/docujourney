'use client';

import { useState, useEffect, useMemo } from 'react';

interface ResponsiveChartConfig {
  defaultHeight: number;
  mobileHeight?: number;
  tabletHeight?: number;
  defaultMargin: { top: number; right: number; bottom: number; left: number };
  mobileMargin?: { top: number; right: number; bottom: number; left: number };
  tabletMargin?: { top: number; right: number; bottom: number; left: number };
}

export const useResponsiveChart = (config: ResponsiveChartConfig) => {
  // Create stable default margins to prevent infinite re-renders
  const defaultMobileMargin = useMemo(() => ({
    top: 5,
    right: 2,
    bottom: 35,
    left: 15,
  }), []);

  const defaultTabletMargin = useMemo(() => ({
    top: 20,
    right: 15,
    bottom: 50,
    left: 35,
  }), []);

  const defaultVerySmallMargin = useMemo(() => ({
    top: 5,
    right: 0,
    bottom: 30,
    left: 10,
  }), []);

  // Create stable references for config margins to prevent infinite re-renders
  const stableDefaultMargin = useMemo(() => config.defaultMargin, [
    config.defaultMargin?.top,
    config.defaultMargin?.right,
    config.defaultMargin?.bottom,
    config.defaultMargin?.left,
  ]);

  const stableMobileMargin = useMemo(() => config.mobileMargin, [
    config.mobileMargin?.top,
    config.mobileMargin?.right,
    config.mobileMargin?.bottom,
    config.mobileMargin?.left,
  ]);

  const stableTabletMargin = useMemo(() => config.tabletMargin, [
    config.tabletMargin?.top,
    config.tabletMargin?.right,
    config.tabletMargin?.bottom,
    config.tabletMargin?.left,
  ]);

  const [dimensions, setDimensions] = useState({
    height: config.defaultHeight,
    margin: stableDefaultMargin,
  });

  useEffect(() => {
    const updateDimensions = () => {
      const width = window.innerWidth;
      
      // Very small mobile (< 375px)
      if (width < 375) {
        setDimensions({
          height: config.mobileHeight || config.defaultHeight * 0.65,
          margin: stableMobileMargin || defaultVerySmallMargin,
        });
      }
      // Mobile
      else if (width < 640) {
        setDimensions({
          height: config.mobileHeight || config.defaultHeight * 0.7,
          margin: stableMobileMargin || defaultMobileMargin,
        });
      }
      // Tablet
      else if (width < 1024) {
        setDimensions({
          height: config.tabletHeight || config.defaultHeight * 0.85,
          margin: stableTabletMargin || defaultTabletMargin,
        });
      }
      // Desktop
      else {
        setDimensions({
          height: config.defaultHeight,
          margin: stableDefaultMargin,
        });
      }
    };

    // Initial calculation
    updateDimensions();

    // Add resize listener
    window.addEventListener('resize', updateDimensions);
    
    // Cleanup
    return () => window.removeEventListener('resize', updateDimensions);
  }, [
    config.defaultHeight,
    config.mobileHeight,
    config.tabletHeight,
    stableDefaultMargin,
    stableMobileMargin,
    stableTabletMargin,
    defaultMobileMargin,
    defaultTabletMargin,
    defaultVerySmallMargin,
  ]);

  return dimensions;
};