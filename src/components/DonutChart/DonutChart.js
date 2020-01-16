import React, { useRef, useEffect } from "react";
import * as d3 from "d3";

const DonutChart = ({ chartData }) => {
  const ref = useRef();
  const width = 220;
  const height = 220;
  const margin = 40;

  useEffect(() => {
    const radius = Math.min(width, height) / 2 - margin;

    const svg = d3
      .select(ref.current)
      .attr("width", width)
      .attr("height", height)
      .append("g")
      .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");

    const data = chartData;

    const color = d3
      .scaleOrdinal()
      .domain(data)
      .range(["is-blocked", "is-alert", "is-running"]);

    const pie = d3.pie().value(function(d) {
      return d.value;
    });
    const dataReady = pie(d3.entries(data));

    svg
      .selectAll("g")
      .data(dataReady)
      .enter()
      .append("path")
      .attr(
        "d",
        d3
          .arc()
          .innerRadius(100)
          .outerRadius(radius)
      )
      .attr("class", function(d) {
        return color(d.data.key);
      });

    return () => {
      console.log("exit", svg);
      svg.remove();
    };
  }, [chartData]);
  return <svg ref={ref} />;
};

export default DonutChart;
