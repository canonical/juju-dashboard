import React, {
  useMemo,
  useState,
  useEffect,
  useLayoutEffect,
  useRef,
} from "react";
import { useSelector } from "react-redux";
import { useParams } from "react-router-dom";

import Topology from "components/Topology/Topology";
import Modal from "@canonical/react-components/dist/components/Modal";

import { getModelUUID, getModelStatus } from "app/selectors";
import { extractCloudName, getViewportWidth } from "app/utils";
import useAnalytics from "hooks/useAnalytics";

import fullScreenIcon from "static/images/icons/fullscreen-icon.svg";

import "./_info-panel.scss";

const infoPanelDimensions = () => {
  const vw = getViewportWidth();
  // If changes are made to the 1580px breakpoint below then be sure to update
  // the same breakpoint in _info-panel.scss.
  const size = vw >= 1580 ? 300 : 230;
  return size;
};

const InfoPanel = () => {
  const { 0: modelName } = useParams();
  const [showExpandedTopology, setShowExpandedTopology] = useState(false);
  const [modalDialogDimensions, setModalDialogDimensions] = useState({});

  const getModelUUIDMemo = useMemo(() => getModelUUID(modelName), [modelName]);
  const modelUUID = useSelector(getModelUUIDMemo);
  const getModelStatusMemo = useMemo(() => getModelStatus(modelUUID), [
    modelUUID,
  ]);
  const modelStatusData = useSelector(getModelStatusMemo);

  const cloudProvider = modelStatusData
    ? extractCloudName(modelStatusData.model.cloudTag)
    : "";

  const { width: modalWidth, height: modalHeight } = modalDialogDimensions;
  const topologySize = infoPanelDimensions();

  const sendAnalytics = useAnalytics();
  const infoPanelRef = useRef();

  // Expanded topology width
  useLayoutEffect(() => {
    const modalDialog = infoPanelRef.current.querySelector(".p-modal__dialog");
    if (modalDialog) {
      setModalDialogDimensions(modalDialog.getBoundingClientRect());
    }
  }, [showExpandedTopology]);

  // Close topology, if open, on Escape key press
  useEffect(() => {
    const closeOnEscape = function (e) {
      if (e.code === "Escape" && showExpandedTopology) {
        setShowExpandedTopology(false);
      }
    };
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("keydown", closeOnEscape);
    };
  });

  return (
    <div className="info-panel" ref={infoPanelRef}>
      {showExpandedTopology ? (
        <Modal
          close={() => setShowExpandedTopology(false)}
          title={modelName.split("/")[1] || modelName}
          data-test="topology-modal"
        >
          <Topology
            width={modalWidth}
            height={modalHeight}
            modelData={modelStatusData}
          />
        </Modal>
      ) : (
        <div className="info-panel__pictogram">
          <Topology
            width={topologySize}
            height={topologySize}
            modelData={modelStatusData}
            data-test="topology"
          />
          {modelName !== undefined && (
            <i
              // @TODO the .p-icon--expand class can be removed when this issue lands
              // https://github.com/canonical-web-and-design/jaas-dashboard/issues/453
              className="p-icon--expand p-icon--fullscreen"
              style={{ backgroundImage: `url(${fullScreenIcon})` }}
              onClick={() => {
                setShowExpandedTopology(!showExpandedTopology);
                sendAnalytics({
                  category: "User",
                  action: "Opened expanded topology",
                });
              }}
            >
              Expand topology
            </i>
          )}
        </div>
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
