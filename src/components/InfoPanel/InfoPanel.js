import React, { useMemo } from "react";
import { useSelector } from "react-redux";
import { useParams } from "react-router-dom";

import { getModelUUID, getModelStatus } from "app/selectors";

import "./_info-panel.scss";

const InfoPanel = () => {
  const { 0: modelName } = useParams();

  const getModelUUIDMemo = useMemo(() => getModelUUID(modelName), [modelName]);
  const modelUUID = useSelector(getModelUUIDMemo);
  const getModelStatusMemo = useMemo(() => getModelStatus(modelUUID), [
    modelUUID
  ]);
  const modelStatusData = useSelector(getModelStatusMemo);

  const cloudProvider = modelStatusData
    ? modelStatusData.model.cloudTag.replace("cloud-", "")
    : "";

  return (
    <div className="info-panel">
      <div className="info-panel__pictogram">
        <img
          src="https://assets.ubuntu.com/v1/f3f75945-home-promo-bundle.svg"
          alt=""
        />
      </div>
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
