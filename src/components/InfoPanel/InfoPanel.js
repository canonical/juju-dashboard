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

  return (
    <div className="info-panel">
      <div className="info-panel__grid">
        <div className="info-panel__grid-item">
          <h4 className="p-muted-heading">Region</h4>
          <p data-name="region">
            {modelStatusData ? modelStatusData.model.region : ""}
          </p>
        </div>
        <div className="info-panel__grid-item">
          <h4 className="p-muted-heading">Controller</h4>
          <p data-name="controller">
            {modelStatusData ? modelStatusData.model.type : ""}
          </p>
        </div>
        <div className="info-panel__grid-item">
          <h4 className="p-muted-heading">Cloud</h4>
          <p data-name="cloud">
            {modelStatusData ? modelStatusData.model.cloudTag : ""}
          </p>
        </div>
        <div className="info-panel__grid-item">
          <h4 className="p-muted-heading">SLA</h4>
          <p data-name="sla">
            {modelStatusData ? modelStatusData.model.sla : ""}
          </p>
        </div>
      </div>
      <img
        src="https://assets.ubuntu.com/v1/f3f75945-home-promo-bundle.svg"
        alt=""
      />
    </div>
  );
};

export default InfoPanel;
