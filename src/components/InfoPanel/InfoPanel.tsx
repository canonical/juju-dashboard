import { Modal, useListener } from "@canonical/react-components";
import { useState } from "react";
import { useSelector } from "react-redux";
import { useParams } from "react-router-dom";

import type { EntityDetailsRoute } from "components/Routes/Routes";
import Topology from "components/Topology/Topology";
import { getViewportWidth } from "components/utils";
import useAnalytics from "hooks/useAnalytics";
import {
  getModelAnnotations,
  getModelApplications,
  getModelRelations,
  getModelUUIDFromList,
} from "store/juju/selectors";

import "./_info-panel.scss";

export enum TestId {
  INFO_PANEL = "info-panel",
}

const expandedTopologyDimensions = () => {
  const de = document.documentElement;
  const vw = Math.max(de.clientWidth, window.innerWidth || 0);
  const vh = Math.max(de.clientHeight, window.innerHeight || 0);
  const delta = 300;
  return {
    width: vw - delta,
    height: vh - delta,
  };
};

const infoPanelDimensions = () => {
  const vw = getViewportWidth();
  // If changes are made to the 1580px breakpoint below then be sure to update
  // the same breakpoint in _info-panel.scss.
  const size = vw >= 1580 ? 300 : 180;
  return size;
};

const InfoPanel = () => {
  const { modelName, userName } = useParams<EntityDetailsRoute>();

  const [showExpandedTopology, setShowExpandedTopology] = useState(false);

  const modelUUID = useSelector(getModelUUIDFromList(modelName, userName));
  const annotations = useSelector(getModelAnnotations(modelUUID));
  const applications = useSelector(getModelApplications(modelUUID));
  const relations = useSelector(getModelRelations(modelUUID));

  const applicationsCount = Object.keys(applications || {}).length;

  const { width, height } = expandedTopologyDimensions();
  const topologySize = infoPanelDimensions();

  const sendAnalytics = useAnalytics();

  // Close topology, if open, on Escape key press
  const closeOnEscape = function (e: KeyboardEvent) {
    if (e.code === "Escape" && showExpandedTopology) {
      setShowExpandedTopology(false);
    }
  };
  useListener(window, closeOnEscape, "keydown");

  const handleExpandTopology = () => {
    setShowExpandedTopology(!showExpandedTopology);
    sendAnalytics({
      path: undefined,
      category: "User",
      action: "Opened expanded topology",
    });
  };

  return (
    <div className="info-panel" data-testid={TestId.INFO_PANEL}>
      {showExpandedTopology ? (
        <Modal
          close={() => setShowExpandedTopology(false)}
          title={modelName?.split("/")[1] || modelName}
        >
          <Topology
            width={width}
            height={height}
            annotations={annotations}
            applications={applications}
            relations={relations}
          />
        </Modal>
      ) : (
        <>
          {applicationsCount > 0 && (
            <div className="info-panel__pictogram">
              <Topology
                width={topologySize}
                height={topologySize}
                annotations={annotations}
                applications={applications}
                relations={relations}
              />
              {modelName !== undefined && (
                <i
                  className="p-icon--fullscreen"
                  onClick={handleExpandTopology}
                  onKeyPress={handleExpandTopology}
                  role="button"
                  tabIndex={0}
                >
                  Expand topology
                </i>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default InfoPanel;
