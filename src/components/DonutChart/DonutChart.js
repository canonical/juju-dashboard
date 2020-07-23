import React, { useRef, useEffect } from "react";
import * as d3 from "d3";

const DonutChart = ({ chartData }) => {
  const svgRef = useRef();
  const width = 100;
  const height = 100;
  const scale = 0.49;

  const isDisabled =
    (chartData?.blocked || 0) +
      (chartData?.alert || 0) +
      (chartData?.running || 0) ===
    0
      ? true
      : false;

  useEffect(() => {
    const radius = Math.min(width, height) / 2;

    const svg = d3
      .select(svgRef.current)
      .attr("width", width)
      .attr("height", height)
      .append("g")
      .attr(
        "transform",
        `translate(${width / 2},${height / 2}) scale(${scale},${scale})`
      );

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
