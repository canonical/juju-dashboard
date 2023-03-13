import { useRef, useEffect } from "react";
import * as d3 from "d3";

type Props = {
  alert?: number;
  blocked?: number;
  running?: number;
};

type KeyValTuple = [string, number];

const DonutChart = ({ alert = 0, blocked = 0, running = 0 }: Props) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const width = 100;
  const height = 100;
  const scale = 0.49;

  const isDisabled = blocked + alert + running === 0 ? true : false;

  useEffect(() => {
    if (!svgRef.current) {
      return;
    }
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

    const data = !isDisabled ? { alert, blocked, running } : { disabled: 1 };

    const color = d3
      .scaleOrdinal<KeyValTuple[0]>()
      .domain(Object.keys(data))
      .range(
        !isDisabled ? ["is-blocked", "is-alert", "is-running"] : ["is-disabled"]
      );

    const pie = d3.pie<void, KeyValTuple>().value((d) => d[1]);
    const dataReady = pie(Object.entries(data));

    svg
      .selectAll("g")
      .data(dataReady)
      .enter()
      .append("path")
      .attr(
        "d",
        d3
          .arc<d3.PieArcDatum<KeyValTuple>>()
          .innerRadius(100)
          .outerRadius(radius)
      )
      .attr("class", (d) => color(d.data[0]));

    return () => {
      svg.remove();
    };
  }, [alert, blocked, running, isDisabled]);
  return <svg ref={svgRef} />;
};

export default DonutChart;
