"use client";

import React, { useRef, useEffect } from 'react';
import * as d3 from 'd3';

interface GeographicChartProps {
  data: Array<{
    state: string;
    applications: number;
    avgSalary: number;
  }>;
  isActive: boolean;
}

export const GeographicChart: React.FC<GeographicChartProps> = ({ data, isActive }) => {
  const chartRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!isActive || !chartRef.current || data.length === 0) return;

    const svg = d3.select(chartRef.current);
    svg.selectAll("*").remove();

    // Fixed dimensions for better visibility
    const margin = { top: 40, right: 40, bottom: 100, left: 120 };
    const width = 700 - margin.left - margin.right;
    const height = 400 - margin.top - margin.bottom;

    // Set SVG dimensions explicitly
    svg.attr("width", width + margin.left + margin.right)
       .attr("height", height + margin.top + margin.bottom)
       .attr("viewBox", `0 0 ${width + margin.left + margin.right} ${height + margin.top + margin.bottom}`);

    const g = svg.append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    // Use the pre-aggregated state data and take top 10
    const stateData = data.slice(0, 10);

    const x = d3.scaleLinear()
      .domain([0, d3.max(stateData, d => d.applications) as number])
      .range([0, width]);

    const y = d3.scaleBand()
      .domain(stateData.map(d => d.state))
      .range([0, height])
      .padding(0.2);

    // Add bars
    g.selectAll(".bar")
      .data(stateData)
      .enter().append("rect")
      .attr("class", "bar")
      .attr("x", 0)
      .attr("y", d => y(d.state)!)
      .attr("width", d => x(d.applications))
      .attr("height", y.bandwidth())
      .attr("fill", "#10b981")
      .attr("stroke", "#059669")
      .attr("stroke-width", 0.5);

    // Add value labels
    g.selectAll(".label")
      .data(stateData)
      .enter().append("text")
      .attr("class", "label")
      .attr("x", d => x(d.applications) + 5)
      .attr("y", d => y(d.state)! + y.bandwidth() / 2)
      .attr("dy", "0.35em")
      .style("font-size", "12px")
      .style("font-weight", "600")
      .text(d => d.applications.toLocaleString());

    // Add axes
    g.append("g")
      .attr("transform", `translate(0,${height})`)
      .call(d3.axisBottom(x).tickFormat(d => d.toLocaleString()));

    g.append("g")
      .call(d3.axisLeft(y));

    // Add axis labels
    g.append("text")
      .attr("transform", `translate(${width / 2}, ${height + margin.bottom - 20})`)
      .style("text-anchor", "middle")
      .style("font-size", "14px")
      .style("font-weight", "600")
      .text("Number of Applications");

    g.append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", 0 - margin.left)
      .attr("x", 0 - (height / 2))
      .attr("dy", "1em")
      .style("text-anchor", "middle")
      .style("font-size", "14px")
      .style("font-weight", "600")
      .text("State");

    // Add title
    g.append("text")
      .attr("x", width / 2)
      .attr("y", -15)
      .attr("text-anchor", "middle")
      .style("font-size", "16px")
      .style("font-weight", "700")
      .text("Top 10 States by H1B Applications");

    console.log("Geographic chart rendered with", stateData.length, "states");
  }, [data, isActive]);

  return <svg ref={chartRef} width="100%" height="100%"></svg>;
};
