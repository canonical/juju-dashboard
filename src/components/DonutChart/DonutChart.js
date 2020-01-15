import React, { useRef, useEffect } from "react";
import * as d3 from "d3";

const DonutChart = ({ chartData }) => {
  const ref = useRef();
  useEffect(() => {
    const width = 220;
    const height = 220;
    const margin = 40;

    // The radius of the pieplot is half the width or half the height (smallest one). I subtract a bit of margin.
    const radius = Math.min(width, height) / 2 - margin;

    // append the svg object to the div called 'my_dataviz'
    const svg = d3
      .select(ref.current)
      .attr("width", width)
      .attr("height", height)
      .append("g")
      .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");

    // Create dummy data
    const data = chartData;
    console.log(data);

    // set the color scale
    const color = d3
      .scaleOrdinal()
      .domain(data)
      .range(["#c7162b", "#f99b11", "#cdcdcd"]);

    // Compute the position of each group on the pie:
    const pie = d3.pie().value(function(d) {
      return d.value;
    });
    const data_ready = pie(d3.entries(data));

    // Build the pie chart: Basically, each part of the pie is a path that we build using the arc function.
    svg
      .selectAll("whatever")
      .data(data_ready)
      .enter()
      .append("path")
      .attr(
        "d",
        d3
          .arc()
          .innerRadius(100) // This is the size of the donut hole
          .outerRadius(radius)
      )
      .attr("fill", function(d) {
        return color(d.data.key);
      })

  }, [chartData]);
  return <svg ref={ref} />;
};

export default DonutChart;
