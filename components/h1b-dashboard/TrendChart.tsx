"use client";

import React, { useRef, useEffect } from 'react';
import * as d3 from 'd3';

interface TrendChartProps {
  data: Array<{
    fiscalYear: string;
    applications: number;
    avgSalary: number;
    medianSalary: number;
  }>;
  isActive: boolean;
}

export const TrendChart: React.FC<TrendChartProps> = ({ data, isActive }) => {
  const chartRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!isActive || !chartRef.current || data.length === 0) return;

    const svg = d3.select(chartRef.current);
    svg.selectAll("*").remove();

    // Fixed dimensions for better visibility
    const margin = { top: 40, right: 40, bottom: 80, left: 80 };
    const width = 700 - margin.left - margin.right;
    const height = 400 - margin.top - margin.bottom;

    // Set SVG dimensions explicitly
    svg.attr("width", width + margin.left + margin.right)
       .attr("height", height + margin.top + margin.bottom)
       .attr("viewBox", `0 0 ${width + margin.left + margin.right} ${height + margin.top + margin.bottom}`);

    const g = svg.append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    // Use the pre-aggregated yearly data
    const chartData = data.sort((a, b) => parseInt(a.fiscalYear) - parseInt(b.fiscalYear));

    if (chartData.length === 0) return;

    const x = d3.scaleLinear()
      .domain(d3.extent(chartData, d => parseInt(d.fiscalYear)) as [number, number])
      .range([0, width]);

    const y = d3.scaleLinear()
      .domain(d3.extent(chartData, d => d.avgSalary) as [number, number])
      .nice()
      .range([height, 0]);

    // Create line generator
    const line = d3.line<typeof chartData[0]>()
      .x(d => x(parseInt(d.fiscalYear)))
      .y(d => y(d.avgSalary))
      .curve(d3.curveMonotoneX);

    // Add grid lines
    g.append("g")
      .attr("class", "grid")
      .attr("transform", `translate(0,${height})`)
      .call(d3.axisBottom(x)
        .tickSize(-height)
        .tickFormat(() => "")
      )
      .style("stroke-dasharray", "3,3")
      .style("opacity", 0.3);

    g.append("g")
      .attr("class", "grid")
      .call(d3.axisLeft(y)
        .tickSize(-width)
        .tickFormat(() => "")
      )
      .style("stroke-dasharray", "3,3")
      .style("opacity", 0.3);

    // Add the line
    g.append("path")
      .datum(chartData)
      .attr("fill", "none")
      .attr("stroke", "#3b82f6")
      .attr("stroke-width", 3)
      .attr("d", line);

    // Add dots
    g.selectAll(".dot")
      .data(chartData)
      .enter().append("circle")
      .attr("class", "dot")
      .attr("cx", d => x(parseInt(d.fiscalYear)))
      .attr("cy", d => y(d.avgSalary))
      .attr("r", 5)
      .attr("fill", "#1e40af")
      .attr("stroke", "#ffffff")
      .attr("stroke-width", 2);

    // Add axes
    g.append("g")
      .attr("transform", `translate(0,${height})`)
      .call(d3.axisBottom(x).tickFormat(d => d.toString()));

    g.append("g")
      .call(d3.axisLeft(y).tickFormat(d => `$${(d as number)/1000}k`));

    // Add axis labels
    g.append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", 0 - margin.left)
      .attr("x", 0 - (height / 2))
      .attr("dy", "1em")
      .style("text-anchor", "middle")
      .style("font-size", "14px")
      .style("font-weight", "600")
      .text("Average Salary");

    g.append("text")
      .attr("transform", `translate(${width / 2}, ${height + margin.bottom - 20})`)
      .style("text-anchor", "middle")
      .style("font-size", "14px")
      .style("font-weight", "600")
      .text("Fiscal Year");

    // Add title
    g.append("text")
      .attr("x", width / 2)
      .attr("y", -15)
      .attr("text-anchor", "middle")
      .style("font-size", "16px")
      .style("font-weight", "700")
      .text("H1B Salary Trends Over Time");

    console.log("Trend chart rendered with", chartData.length, "data points");
  }, [data, isActive]);

  return <svg ref={chartRef} width="100%" height="100%"></svg>;
};
