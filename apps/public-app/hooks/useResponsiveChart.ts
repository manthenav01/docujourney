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

  const [dimensions, setDimensions] = useState({
    height: config.defaultHeight,
    margin: config.defaultMargin,
  });

  useEffect(() => {
    const updateDimensions = () => {
      const width = window.innerWidth;
      
      // Very small mobile (< 375px)
      if (width < 375) {
        setDimensions({
          height: config.mobileHeight || config.defaultHeight * 0.65,
          margin: config.mobileMargin || defaultVerySmallMargin,
        });
      }
      // Mobile
      else if (width < 640) {
        setDimensions({
          height: config.mobileHeight || config.defaultHeight * 0.7,
          margin: config.mobileMargin || defaultMobileMargin,
        });
      }
      // Tablet
      else if (width < 1024) {
        setDimensions({
          height: config.tabletHeight || config.defaultHeight * 0.85,
          margin: config.tabletMargin || defaultTabletMargin,
        });
      }
      // Desktop
      else {
        setDimensions({
          height: config.defaultHeight,
          margin: config.defaultMargin,
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
    config.defaultMargin,
    config.mobileMargin,
    config.tabletMargin,
    defaultMobileMargin,
    defaultTabletMargin,
    defaultVerySmallMargin,
  ]);

  return dimensions;
};