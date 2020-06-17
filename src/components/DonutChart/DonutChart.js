import React, { useRef, useEffect } from "react";
import * as d3 from "d3";

const DonutChart = ({ chartData }) => {
  const svgRef = useRef();
  const width = 220;
  const height = 220;
  const margin = 40;

  const isDisabled =
    (chartData?.blocked || 0) +
    (chartData?.alert || 0) +
    (chartData?.running || 0)
      ? 0 > false
      : true;

  useEffect(() => {
    const radius = Math.min(width, height) / 2 - margin;

    const svg = d3
      .select(svgRef.current)
      .attr("width", width)
      .attr("height", height)
      .append("g")
      .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");

    const data = !isDisabled ? chartData : { disabled: 1 };

    const color = d3
      .scaleOrdinal()
      .domain(data)
      .range(
        !isDisabled ? ["is-blocked", "is-alert", "is-running"] : ["is-disabled"]
      );

    const pie = d3.pie().value(function (d) {
      return d.value;
    });
    const dataReady = pie(d3.entries(data));

    svg
      .selectAll("g")
      .data(dataReady)
      .enter()
      .append("path")
      .attr("d", d3.arc().innerRadius(100).outerRadius(radius))
      .attr("class", function (d) {
        return color(d.data.key);
      });

    return () => {
      svg.remove();
    };
  }, [chartData, isDisabled]);
  return <svg ref={svgRef} />;
};

export default DonutChart;
