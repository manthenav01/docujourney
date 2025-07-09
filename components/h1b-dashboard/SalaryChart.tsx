"use client";

import React, { useRef, useEffect } from 'react';
import * as d3 from 'd3';

interface SalaryChartProps {
  data: Array<{
    range: string;
    count: number;
    minSalary: number;
    maxSalary: number;
  }>;
  isActive: boolean;
}

export const SalaryChart: React.FC<SalaryChartProps> = ({ data, isActive }) => {
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

    // Use the pre-aggregated salary distribution data
    const x = d3.scaleBand()
      .domain(data.map(d => d.range))
      .range([0, width])
      .padding(0.1);

    const y = d3.scaleLinear()
      .domain([0, d3.max(data, d => d.count) as number])
      .range([height, 0]);

    // Add bars
    g.selectAll(".bar")
      .data(data)
      .enter().append("rect")
      .attr("class", "bar")
      .attr("x", d => x(d.range)!)
      .attr("width", x.bandwidth())
      .attr("y", d => y(d.count))
      .attr("height", d => height - y(d.count))
      .attr("fill", "#3b82f6")
      .attr("stroke", "#1e40af")
      .attr("stroke-width", 0.5);

    // Add tooltips
    g.selectAll(".bar")
      .on("mouseover", function(event, d: any) {
        // Create tooltip
        const tooltip = d3.select("body").append("div")
          .attr("class", "tooltip")
          .style("opacity", 0)
          .style("position", "absolute")
          .style("background", "rgba(0, 0, 0, 0.8)")
          .style("color", "white")
          .style("padding", "8px")
          .style("border-radius", "4px")
          .style("font-size", "12px");

        tooltip.transition()
          .duration(200)
          .style("opacity", .9);
        tooltip.html(`${d.range}<br/>Applications: ${d.count.toLocaleString()}`)
          .style("left", (event.pageX + 10) + "px")
          .style("top", (event.pageY - 28) + "px");
      })
      .on("mouseout", function() {
        d3.selectAll(".tooltip").remove();
      });

    // Add axes
    g.append("g")
      .attr("transform", `translate(0,${height})`)
      .call(d3.axisBottom(x))
      .selectAll("text")
      .style("text-anchor", "end")
      .attr("dx", "-.8em")
      .attr("dy", ".15em")
      .attr("transform", "rotate(-45)");

    g.append("g")
      .call(d3.axisLeft(y));

    // Add axis labels
    g.append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", 0 - margin.left)
      .attr("x", 0 - (height / 2))
      .attr("dy", "1em")
      .style("text-anchor", "middle")
      .style("font-size", "14px")
      .style("font-weight", "600")
      .text("Number of Applications");

    g.append("text")
      .attr("transform", `translate(${width / 2}, ${height + margin.bottom - 20})`)
      .style("text-anchor", "middle")
      .style("font-size", "14px")
      .style("font-weight", "600")
      .text("Salary Range");

    // Add title
    g.append("text")
      .attr("x", width / 2)
      .attr("y", -15)
      .attr("text-anchor", "middle")
      .style("font-size", "16px")
      .style("font-weight", "700")
      .text("H1B Salary Distribution");

    console.log("Salary chart rendered with", data.length, "salary ranges");
  }, [data, isActive]);

  return <svg ref={chartRef} width="100%" height="100%"></svg>;
};
