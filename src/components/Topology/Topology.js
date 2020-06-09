import React, { useRef, useEffect, useState } from "react";
import { useSelector } from "react-redux";
import * as d3 from "d3";
import { updateAnnotations } from "juju/index";
import { generateIconPath, extractOwnerName } from "app/utils";
import { getActiveUserTag } from "app/selectors";
import fullScreenIcon from "static/images/icons/fullscreen-icon.svg";

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

const Topology = ({ modelData }) => {
  const svgRef = useRef();
  const topologyRef = useRef();
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isReadOnly, setisReadOnly] = useState(false);

  const activeUser = useSelector(getActiveUserTag);

  const { deltaX, deltaY } = computePositionDelta(modelData?.annotations);

  const modelOwner = extractOwnerName(modelData?.info?.ownerTag || "");
  const currentActiveUser = extractOwnerName(activeUser || "");

  // If active user and model owner are oen and the same, grant write access
  // to reposition topology
  useEffect(() => {
    if (modelOwner !== "" && currentActiveUser !== "") {
      setisReadOnly(modelOwner !== currentActiveUser);
    }
  }, [modelOwner, currentActiveUser]);

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
    const topologyEl = topologyRef?.current.querySelector(".topology__inner");
    const topologyDimensions = topologyEl
      ? topologyEl.getBoundingClientRect()
      : {};

    const { width: topologyWidth, height: topologyHeight } = topologyDimensions;

    const width = topologyWidth;
    const height = !isFullscreen ? topologyWidth : topologyHeight;

    const topo = d3
      .select(svgRef.current)
      .attr("viewBox", `0 0 ${width} ${height}`)
      .call(
        d3.zoom().on("zoom", function () {
          topo.attr("transform", d3.event.transform);
        })
      )
      .append("g");

    const appIcons = topo.selectAll(".application").data(applications);

    let gridCount = {
      x: 0,
      y: maxY,
    };

    const relationLines = topo.selectAll(".relation").data(relations);
    const relationLine = relationLines.enter().insert("g", ":first-child");

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
        const topoNode = topo.node();
        const { width: svgWidth, height: svgHeight } = topoNode
          ? topoNode.getBoundingClientRect()
          : {};

        // Whenever a new element is added zoom the canvas to fit.
        if (svgWidth > 0 && svgHeight > 0) {
          const scale = Math.min(width / svgWidth, height / svgHeight) || 1;

          const translateX = (width - svgWidth * scale) / 2 || 0;
          const translateY = (height - svgHeight * scale) / 2 || 0;
          topo
            .attr(
              "transform",
              `translate(${translateX},${translateY}) scale(${scale},${scale})`
            )
            .attr("width", `${width}`);
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

    function dragstarted() {
      d3.select(this).select("circle").attr("stroke", "#E9531F");
    }

    function drag() {
      const app = d3.select("circle", this);
      const radius = app.attr("r");

      d3.select(this).attr("transform", () => {
        const iconX = d3.event.x - radius;
        const iconY = d3.event.y - radius;

        return `translate(${iconX}, ${iconY})`;
      });
      updateRelations(relationLine);
    }

    function dragended() {
      d3.select(this).select("circle").attr("stroke", "#888888");
      updateAnnotations();
    }

    if (!isReadOnly) {
      appIcon.call(
        d3.drag().on("start", dragstarted).on("drag", drag).on("end", dragended)
      );
    }

    setRelations(relationLine);

    appIcons.exit().remove();
    relationLines.exit().remove();

    return () => {
      topo.remove();
    };
  }, [
    applications,
    deltaX,
    deltaY,
    isFullscreen,
    isReadOnly,
    maxX,
    maxY,
    relations,
  ]);

  // Close topology, if open, on Escape key press
  useEffect(() => {
    const closeOnEscape = function (e) {
      if (e.code === "Escape" && isFullscreen) {
        setIsFullscreen(false);
      }
    };
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("keydown", closeOnEscape);
    };
  });

  return (
    <div className="topology" data-fullscreen={isFullscreen} ref={topologyRef}>
      <div className="topology__inner">
        {isFullscreen && (
          <i className="p-icon--close" onClick={() => setIsFullscreen(false)} />
        )}

        {modelData ? (
          <svg ref={svgRef} />
        ) : (
          <div className="topology__loading">
            <i className="p-icon--spinner">Loading...</i>
          </div>
        )}

        {!isFullscreen && modelData && (
          <i
            style={{ backgroundImage: `url(${fullScreenIcon})` }}
            className="p-icon--expand p-icon--fullscreen"
            onClick={() => setIsFullscreen(true)}
          />
        )}
        {isReadOnly && isFullscreen && (
          <span className="read-only">Read only</span>
        )}
      </div>
    </div>
  );
};

export default React.memo(Topology);
