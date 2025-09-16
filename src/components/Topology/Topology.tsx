import cloneDeep from "clone-deep";
import * as d3 from "d3";
import { useRef, useEffect, memo } from "react";

import type {
  AnnotationData,
  ApplicationData,
  ApplicationInfo,
  RelationData,
} from "juju/types";
import defaultCharmIcon from "static/images/icons/default-charm-icon.svg";
import { generateIconPath } from "store/juju/utils/models";

type Props = {
  annotations: AnnotationData | null;
  applications: ApplicationData | null;
  relations: null | RelationData;
  width: number;
  height: number;
};

type Application = {
  name: string;
  annotations: AnnotationData[0];
} & ApplicationInfo;

/**
  Returns whether the application is a subordinate.
  @param app The application status object.
  @returns If the application is a subordinate.
*/
const isSubordinate = (app: Application): boolean =>
  "subordinate" in app && app.subordinate;

/**
  Computes the maximum delta from 0 for both the x and y axis. This is necessary
  because there are no restrictions on placing applications in a bundle at
  negative indexes.
  @param annotations The annotations object from the model status.
  @returns The deltas for x and y in the keys { deltaX, deltaY }.
*/
const computePositionDelta = (
  annotations: AnnotationData | null,
): { deltaX: null | number; deltaY: null | number } => {
  let deltaX: null | number = null;
  let deltaY: null | number = null;

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
  @param annotations The annotations object from the model status.
  @returns The value of the annotation with the highest X and Y value.
*/
const computeMaxXY = (
  annotations: AnnotationData | null,
): { maxX: number; maxY: number } => {
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
  @param position
  @param delta
  @returns The position value with the delta applied.
*/
const applyDelta = (
  position: null | number | string = null,
  delta: null | number | string = null,
): number =>
  (typeof position === "number" ? position : parseFloat(position || "0")) +
  -(typeof delta === "number" ? delta : parseFloat(delta || "0"));

/**
  Generates the relation positions for the two endpoints based on the
  application name data passed in.
  @param data The relation data.
  @returns x and y coordinates for the two relation endpoints.
*/
const getRelationPosition = (
  data: string[],
): {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
} => {
  // Gets the values from the elements translate attribute.
  // translate(123.456, 789.012)
  const translateValues = /(\d*\.?\d*),\s(\d*\.?\d*)/;
  const getElement = (
    index: number,
  ): d3.Selection<d3.BaseType, Application, HTMLElement, unknown> =>
    d3.select<d3.BaseType, Application>(`[data-name="${data[index]}"]`);
  const getRect = (
    element: d3.Selection<d3.BaseType, Application, HTMLElement, void>,
  ): null | RegExpExecArray | void => {
    const node = element?.node();
    if (node && "getAttribute" in node) {
      const transform = node.getAttribute("transform");
      return transform ? translateValues.exec(transform) : null;
    }
  };
  const getData = (
    element: d3.Selection<d3.BaseType, Application, HTMLElement, void>,
  ): Application => element.data()[0];

  const element1 = getElement(0);
  const element2 = getElement(1);
  const app1 = getRect(element1);
  const app2 = getRect(element2);

  return {
    x1: applyDelta(app1?.[1], isSubordinate(getData(element1)) ? -60 : -90),
    y1: applyDelta(app1?.[2], isSubordinate(getData(element1)) ? -60 : -90),
    x2: applyDelta(app2?.[1], isSubordinate(getData(element2)) ? -60 : -90),
    y2: applyDelta(app2?.[2], isSubordinate(getData(element2)) ? -60 : -90),
  };
};

// Memoize the component as the D3 rendering is expensive and causes visual
// glitches.
const Topology = memo(
  ({
    annotations,
    applications: applicationData,
    relations: relationData,
    width,
    height,
  }: Props) => {
    const ref = useRef<SVGSVGElement>(null);
    // Clone the data so that it can be manipulated before rendering.
    const annotationData = cloneDeep(annotations);

    const { deltaX, deltaY } = computePositionDelta(annotationData);

    const applications: Application[] = Object.entries(
      applicationData ?? {},
    ).map(([appName, application]) => {
      return {
        ...application,
        annotations: annotationData?.[appName] ?? {},
        name: appName,
      };
    });

    // Apply deltas to the annotations.
    for (const appName in annotationData) {
      const annotation = annotationData[appName];
      if (annotation["gui-x"]) {
        annotation["gui-x"] = applyDelta(
          annotation["gui-x"],
          deltaX,
        ).toString();
      }
      if (annotation["gui-y"]) {
        annotation["gui-y"] = applyDelta(
          annotation["gui-y"],
          deltaY,
        ).toString();
      }
    }

    const computeMax = computeMaxXY(annotationData);
    let { maxX } = computeMax;
    const { maxY } = computeMax;
    if (maxX === 0) {
      // If there is no maxX then all of the icons are unplaced
      // so set a maximum width.
      maxX = 500;
    }

    // Dedupe the relations as we only draw a single line between two
    // applications regardless of how many relations are between them.
    const extractor = /(.+):(.+)\s(.+):(.+)/;
    const endpoints = Object.entries(relationData ?? {}).reduce<string[]>(
      (acc, [key, relation]) => {
        // We don't draw peer relations so we can ignore them.
        if (relation.endpoints.length > 1) {
          const parts = key.match(extractor);
          if (parts) {
            acc.push(`${parts[1]}:${parts[3]}`);
          }
        }
        return acc;
      },
      [],
    );

    // Remove any duplicate endpoints and split into pairs.
    const deDupedRelations = [...new Set(endpoints)].map((pair) =>
      pair.split(":"),
    );
    // Remove relations that do not have all applications in the map.
    // The missing application is likely a cross-model-relation which isn't
    // fully supported yet.
    // https://github.com/canonical/juju-dashboard/issues/526
    const applicationNames = Object.keys(applicationData ?? {});

    const relations = deDupedRelations.filter(
      (relation) =>
        applicationNames.includes(relation[0]) &&
        applicationNames.includes(relation[1]),
    );

    useEffect(() => {
      const svgNode = ref.current;
      if (!svgNode) {
        return;
      }
      const topo = d3
        .select(svgNode)
        .attr("viewBox", `0 0 ${width} ${height}`)
        .append("g");

      const appIcons = topo.selectAll(".application").data(applications);

      const gridCount = {
        x: 0,
        y: maxY,
      };

      const appIcon = appIcons
        .enter()
        .append("g")
        .attr("transform", (application) => {
          const adjustment = isSubordinate(application) ? 30 : 0;
          const x =
            application.annotations["gui-x"] ?? gridCount.x + adjustment;
          const y =
            application.annotations["gui-y"] !== undefined
              ? Number(application.annotations["gui-y"])
              : gridCount.y + adjustment;
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
        .attr("data-name", (application) => application.name)
        .append("circle")
        .attr("cx", (application) => (isSubordinate(application) ? 60 : 90))
        .attr("cy", (application) => (isSubordinate(application) ? 60 : 90))
        .attr("r", (application) => (isSubordinate(application) ? 60 : 90))
        .attr("fill", "#f5f5f5")
        .attr("stroke-width", 3)
        .attr("stroke", "#888888")
        .call((_) => {
          // When ever a new element is added zoom the canvas to fit.
          let svgHeight = 0;
          let svgWidth = 0;
          let parentHeight = 0;
          let parentWidth = 0;
          const rect = topo?.node()?.getBoundingClientRect();
          // Get the rect of the containing <svg>. This could be different to the
          // width and height passed into this component due to the responsive design.
          const parentRect = topo
            .node()
            ?.parentElement?.getBoundingClientRect();
          if (rect && parentRect) {
            svgWidth = rect.width;
            svgHeight = rect.height;
            parentWidth = parentRect.width;
            parentHeight = parentRect.height;
          }
          if (svgWidth > 0 && svgHeight > 0) {
            const containerScale = Math.min(
              width / parentWidth,
              height / parentHeight,
            );
            // Magic number that presents reasonable padding around the viz.
            const padding = 200 / containerScale;
            const scale = Math.min(
              parentWidth / (svgWidth + padding),
              parentHeight / (svgHeight + padding),
            );
            const translateX =
              ((parentWidth - svgWidth * scale) / 2) * containerScale;
            const translateY =
              ((parentHeight - svgHeight * scale) / 2) * containerScale;
            topo.attr(
              "transform",
              `translate(${translateX},${translateY}) scale(${scale},${scale})`,
            );
          }
        });

      appIcon
        .append("image")
        .attr("xlink:href", (application) =>
          "charm-url" in application
            ? generateIconPath(application["charm-url"])
            : null,
        )
        // use a fallback image if the icon is not found
        .on("error", function () {
          d3.select(this).attr("xlink:href", () => defaultCharmIcon);
        })
        .attr("width", (application) => (isSubordinate(application) ? 96 : 126))
        .attr("height", (application) =>
          isSubordinate(application) ? 96 : 126,
        )
        .attr("transform", (application) =>
          isSubordinate(application)
            ? "translate(13, 13)"
            : "translate(28, 28)",
        )
        .attr("clip-path", (application) =>
          isSubordinate(application)
            ? "circle(43px at 48px 48px)"
            : "circle(55px at 63px 63px)",
        );

      const relationLines = topo.selectAll(".relation").data(relations);
      const relationLine = relationLines.enter().insert("g", ":first-child");

      relationLine
        .classed("relation", true)
        .append("line")
        .attr("x1", (relation) => getRelationPosition(relation).x1)
        .attr("y1", (relation) => getRelationPosition(relation).y1)
        .attr("x2", (relation) => getRelationPosition(relation).x2)
        .attr("y2", (relation) => getRelationPosition(relation).y2)
        .attr("stroke", "#666666")
        .attr("stroke-width", 2);

      appIcons.exit().remove();
      relationLines.exit().remove();

      return (): void => {
        topo.remove();
      };
    }, [applications, deltaX, deltaY, height, width, maxX, maxY, relations]);
    return <svg ref={ref} />;
  },
);

export default Topology;
