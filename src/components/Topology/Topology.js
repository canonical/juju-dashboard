import React, { useRef, useEffect } from "react";
import * as d3 from "d3";

import { generateIconPath } from "app/utils";

const isSubordinate = app => app.subordinateTo.length > 0;

export default ({ modelData, width, height }) => {
  const ref = useRef();

  const applications =
    (modelData &&
      Object.keys(modelData.applications).map(appName => ({
        ...modelData.applications[appName],
        name: appName
      }))) ||
    [];

  useEffect(() => {
    const zoom = d3.zoom();

    const topo = d3
      .select(ref.current)
      .attr("width", width)
      .attr("height", height)
      .append("g")
      .call(zoom)
      // 2 lines below copied....why do they work?
      .call(zoom.transform, d3.zoomIdentity.translate(100, 50).scale(0.5))
      .attr("transform", "translate(100,50) scale(.5,.5)");

    const appIcons = topo.selectAll(".application").data(applications);

    const appIcon = appIcons.enter().append("g");

    appIcon
      .classed("application", true)
      .attr("data-name", d => d.name)
      .append("circle")
      .attr("cx", d => (isSubordinate(d) ? 65 : 95))
      .attr("cy", d => (isSubordinate(d) ? 65 : 95))
      .attr("r", d => (isSubordinate(d) ? 60 : 90))
      .attr("fill", "#f5f5f5")
      .attr("stroke-width", 1)
      .attr("stroke", "#888888");

    appIcon
      .append("image")
      .attr("xlink:href", d => generateIconPath(d.charm.replace("cs:", "")))
      .attr("width", 96)
      .attr("height", 96)
      .attr("transform", d =>
        isSubordinate(d) ? "translate(17, 17)" : "translate(47, 47)"
      );

    // console.log(topo.selectAll(".application").nodes());

    appIcons.exit().remove();

    return () => {
      topo.remove();
    };
  }, [applications, height, width]);
  return <svg ref={ref} />;
};
