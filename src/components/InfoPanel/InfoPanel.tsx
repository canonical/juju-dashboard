import { useState } from "react";
import { useParams } from "react-router-dom";

import Topology from "components/Topology/Topology";
import Modal from "@canonical/react-components/dist/components/Modal";

import { extractCloudName, getViewportWidth } from "app/utils";
import useAnalytics from "hooks/useAnalytics";
import useModelStatus from "hooks/useModelStatus";
import useEventListener from "hooks/useEventListener";

import type { TSFixMe } from "types";

import "./_info-panel.scss";

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
  const { 0: modelName = "" } = useParams<{ 0: string }>();

  const [showExpandedTopology, setShowExpandedTopology] = useState(false);
  const modelStatusData: TSFixMe = useModelStatus();
  const applicationsCount = Object.entries(modelStatusData.applications || {})
    .length;

  const cloudProvider = modelStatusData
    ? extractCloudName(modelStatusData.model["cloud-tag"])
    : "";

  const { width, height } = expandedTopologyDimensions();
  const topologySize = infoPanelDimensions();

  const sendAnalytics = useAnalytics();

  // Close topology, if open, on Escape key press
  const closeOnEscape = function (e: KeyboardEvent) {
    if (e.code === "Escape" && showExpandedTopology) {
      setShowExpandedTopology(false);
    }
  };
  useEventListener("keydown", closeOnEscape);

  const handleExpandTopology = () => {
    setShowExpandedTopology(!showExpandedTopology);
    sendAnalytics({
      path: undefined,
      category: "User",
      action: "Opened expanded topology",
    });
  };

  return (
    <div className="info-panel">
      {showExpandedTopology ? (
        <Modal
          close={() => setShowExpandedTopology(false)}
          title={modelName?.split("/")[1] || modelName}
          data-test="topology-modal"
        >
          <Topology width={width} height={height} modelData={modelStatusData} />
        </Modal>
      ) : (
        <>
          {applicationsCount > 0 && (
            <div className="info-panel__pictogram">
              <Topology
                width={topologySize}
                height={topologySize}
                modelData={modelStatusData}
                data-test="topology"
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
      <div className="info-panel__grid">
        <div className="info-panel__grid-item">
          <h4 className="p-muted-heading">Controller</h4>
          <p data-name="controller">
            {modelStatusData ? modelStatusData.model.type : ""}
          </p>
        </div>
        <div className="info-panel__grid-item">
          <h4 className="p-muted-heading">Cloud/Region</h4>
          <p data-name="cloud-region">
            {cloudProvider}
            {modelStatusData ? "/" : ""}
            {modelStatusData ? modelStatusData.model.region : ""}
          </p>
        </div>
        <div className="info-panel__grid-item">
          <h4 className="p-muted-heading">Version</h4>
          <p data-name="version">
            {modelStatusData ? modelStatusData.model.version : ""}
          </p>
        </div>
        <div className="info-panel__grid-item">
          <h4 className="p-muted-heading">SLA</h4>
          <p data-name="sla">
            {modelStatusData ? modelStatusData.model.sla : ""}
          </p>
        </div>
      </div>
    </div>
  );
};

export default InfoPanel;
