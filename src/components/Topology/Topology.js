import React, { useRef, useEffect } from "react";
import * as d3 from "d3";
import { generateIconPath } from "app/utils";

import "./topology.scss";

/**
  Returns whether the application is a subordinate.
  @param {Object} app The application status object.
  @returns {Boolean} If the application is a subordinate.
*/
const isSubordinate = (app) => app.subordinateTo.length > 0;

/**
  Computes the maximum delta from 0 for both the x and y axis. This is necessary
  because there are no restrictions on placing applications in a bundle at
  negative indexes.
  @param {Object} annotations The annotations object from the model status.
  @returns {Object} The deltas for x and y in the keys { deltaX, deltaY }.
*/
const computePositionDelta = (annotations) => {
  let deltaX = null;
  let deltaY = null;

  if (!annotations) {
    return { deltaX, deltaY };
  }

  Object.keys(annotations).forEach((appName) => {
    const { "gui-x": guiX, "gui-y": guiY } = annotations[appName];
    const x = parseFloat(guiX);
    const y = parseFloat(guiY);
    if (!isNaN(x) && (deltaX === null || x < deltaX)) {
      deltaX = x;
    }
    if (!isNaN(y) && (deltaY === null || y < deltaY)) {
      deltaY = y;
    }
  });

  return { deltaX, deltaY };
};

/**
  Retrieve the X and Y annotation with the highest value.
  @param {Object} annotations The annotations object from the model status.
  @returns {Object} The value of the annotation with the highest X and Y value.
*/
const computeMaxXY = (annotations) => {
  let maxY = 0;
  let maxX = 0;
  if (!annotations) {
    return { maxX, maxY };
  }

  Object.keys(annotations).forEach((appName) => {
    const { "gui-x": guiX, "gui-y": guiY } = annotations[appName];
    const y = parseFloat(guiY);
    const x = parseFloat(guiX);
    if (!isNaN(x) && x > maxX) {
      maxX = x;
    }
    if (!isNaN(y) && y > maxY) {
      maxY = y;
    }
  });

  return { maxX, maxY };
};

/**
  Applies the supplied delta to the supplied position. Both inputs are parsed
  as floats.
  @param {Number} position
  @param {Number} delta
  @returns {Float} The position value with the delta applied.
*/
const applyDelta = (position, delta) =>
  parseFloat(position) + -parseFloat(delta);

/**
  Generates the relation positions for the two endpoints based on the
  application name data passed in.
  @param {*} data The relation data.
  @returns {Object} x and y coordinates for the two relation endpoints.
*/
const getRelationPosition = (data) => {
  // Gets the values from the elements translate attribute.
  // translate(123.456, 789.012)
  const translateValues = /(\d*\.?\d*),\s(\d*\.?\d*)/;
  const getElement = (index) => d3.select(`[data-name="${data[index]}"]`);
  const getRect = (element) =>
    translateValues.exec(element.node().getAttribute("transform"));
  const getData = (element) => element.data()[0];

  const element1 = getElement(0);
  const element2 = getElement(1);
  const app1 = getRect(element1);
  const app2 = getRect(element2);

  return {
    x1: applyDelta(app1[1], isSubordinate(getData(element1)) ? -60 : -90),
    y1: applyDelta(app1[2], isSubordinate(getData(element1)) ? -60 : -90),
    x2: applyDelta(app2[1], isSubordinate(getData(element2)) ? -60 : -90),
    y2: applyDelta(app2[2], isSubordinate(getData(element2)) ? -60 : -90),
  };
};

const Topology = ({ modelData, width, height }) => {
  const ref = useRef();

  const { deltaX, deltaY } = computePositionDelta(modelData?.annotations);

  const applications =
    (modelData &&
      Object.keys(modelData.applications).map((appName) => ({
        ...modelData.annotations[appName],
        ...modelData.applications[appName],
        name: appName,
      }))) ||
    [];

  // Apply deltas to the annotations.
  for (const appName in applications) {
    const application = applications[appName];
    if (application["gui-x"]) {
      application["gui-x"] = applyDelta(application["gui-x"], deltaX);
    }
    if (application["gui-y"]) {
      application["gui-y"] = applyDelta(application["gui-y"], deltaY);
    }
  }

  let { maxX, maxY } = computeMaxXY(modelData?.annotations);
  if (maxX === 0) {
    // If there is no maxX then all of the icons are unplaced
    // so set a maximum width.
    maxX = 500;
  }

  // Dedupe the relations as we only draw a single line between two
  // applications regardless of how many relations are between them.
  const endpoints = modelData?.relations.reduce((acc, relation) => {
    const endpoints = relation.endpoints;
    // We don't draw peer relations so we can ignore them.
    if (endpoints.length > 1) {
      acc.push(`${endpoints[0].application}:${endpoints[1].application}`);
    }
    return acc;
  }, []);
  // Remove any duplicate endpoints and split into pairs.
  const deDupedRelations = [...new Set(endpoints)].map((pair) =>
    pair.split(":")
  );
  // Remove relations that do not have all applications in the map.
  // The missing application is likely a cross-model-relation which isn't
  // fully supported yet.
  // https://github.com/canonical-web-and-design/jaas-dashboard/issues/526
  const applicationNames = applications.map((app) => app.name);
  const relations = deDupedRelations.filter(
    (relation) =>
      applicationNames.includes(relation[0]) &&
      applicationNames.includes(relation[1])
  );
  useEffect(() => {
    const topo = d3
      .select(ref.current)
      .attr("viewBox", `0 0 ${width} ${height}`)
      .append("g");

    const appIcons = topo.selectAll(".application").data(applications);

    let gridCount = {
      x: 0,
      y: maxY,
    };

    const relationLines = topo.selectAll(".relation").data(relations);
    const relationLine = relationLines.enter().insert("g", ":first-child");

    function drag() {
      const radius = d3.select("circle", this).attr("r");
      d3.select(this)
        .raise()
        .attr("transform", (d) => {
          const x = d3.event.x - radius;
          const y = d3.event.y - radius;
          return `translate(${x}, ${y})`;
        });
      updateRelations(relationLine);
    }

    function setRelations(relationLine) {
      relationLine
        .classed("relation", true)
        .append("line")
        .attr("x1", (d) => getRelationPosition(d).x1)
        .attr("y1", (d) => getRelationPosition(d).y1)
        .attr("x2", (d) => getRelationPosition(d).x2)
        .attr("y2", (d) => getRelationPosition(d).y2)
        .attr("stroke", "#666666")
        .attr("stroke-width", 2);
    }

    function updateRelations(relationLine) {
      relationLine
        .select("line")
        .attr("x1", (d) => getRelationPosition(d).x1)
        .attr("y1", (d) => getRelationPosition(d).y1)
        .attr("x2", (d) => getRelationPosition(d).x2)
        .attr("y2", (d) => getRelationPosition(d).y2);
    }

    const appIcon = appIcons
      .enter()
      .append("g")
      .call(d3.drag().on("drag", drag))
      .attr("transform", (d) => {
        const x = d["gui-x"] !== undefined ? d["gui-x"] : gridCount.x;
        const y = d["gui-y"] !== undefined ? d["gui-y"] : gridCount.y;
        gridCount.x += 250;
        // Let the placed units determine the max width of the visualization.
        // and move the grid units to a new line.
        if (gridCount.x > maxX) {
          gridCount.x = 0;
          gridCount.y += 200;
        }
        return `translate(${x}, ${y})`;
      });

    appIcon
      .classed("application", true)
      .attr("data-name", (d) => d.name)
      .append("circle")
      .attr("cx", (d) => (isSubordinate(d) ? 60 : 90))
      .attr("cy", (d) => (isSubordinate(d) ? 60 : 90))
      .attr("r", (d) => (isSubordinate(d) ? 60 : 90))
      .attr("fill", "#f5f5f5")
      .attr("stroke-width", 3)
      .attr("stroke", "#888888")
      .call((_) => {
        // Whenever a new element is added zoom the canvas to fit.
        const {
          width: svgWidth,
          height: svgHeight,
        } = topo.node().getBoundingClientRect();
        if (svgWidth > 0 && svgHeight > 0) {
          // Magic number that presents reasonable padding around the viz.
          const padding = 200;
          const scale = Math.min(
            width / (svgWidth + padding),
            height / (svgHeight + padding)
          );
          const translateX = (width - svgWidth * scale) / 2;
          const translateY = (height - svgHeight * scale) / 2;
          topo.attr(
            "transform",
            `translate(${translateX},${translateY}) scale(${scale},${scale})`
          );
        }
      });

    appIcon
      .append("image")
      .attr("xlink:href", (d) => generateIconPath(d.charm))
      .attr("width", (d) => (isSubordinate(d) ? 96 : 126))
      .attr("height", (d) => (isSubordinate(d) ? 96 : 126))
      .attr("transform", (d) =>
        isSubordinate(d) ? "translate(13, 13)" : "translate(28, 28)"
      )
      .attr("clip-path", (d) =>
        isSubordinate(d)
          ? "circle(43px at 48px 48px)"
          : "circle(55px at 63px 63px)"
      );

    setRelations(relationLine);

    appIcons.exit().remove();
    relationLines.exit().remove();

    return () => {
      topo.remove();
    };
  }, [applications, deltaX, deltaY, height, width, maxX, maxY, relations]);
  return <svg ref={ref} />;
};

export default React.memo(Topology);
