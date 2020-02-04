import React, { useEffect, useMemo } from "react";
import MainTable from "@canonical/react-components/dist/components/MainTable";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router-dom";

import Filter from "components/Filter/Filter";
import InfoPanel from "components/InfoPanel/InfoPanel";
import Layout from "components/Layout/Layout";
import Terminal from "components/Terminal/Terminal";
import Header from "components/Header/Header";
import UserIcon from "components/UserIcon/UserIcon";

import { getModelUUID, getModelStatus } from "app/selectors";
import { fetchModelStatus } from "juju/actions";
import { collapsibleSidebar } from "app/actions";
import {
  applicationTableHeaders,
  unitTableHeaders,
  machineTableHeaders,
  relationTableHeaders,
  generateApplicationRows,
  generateMachineRows,
  generateRelationRows,
  generateUnitRows
} from "./generators";

import "./_model-details.scss";

const ModelDetails = () => {
  const { 0: modelName } = useParams();
  const dispatch = useDispatch();

  const getModelUUIDMemo = useMemo(() => getModelUUID(modelName), [modelName]);
  const modelUUID = useSelector(getModelUUIDMemo);
  const getModelStatusMemo = useMemo(() => getModelStatus(modelUUID), [
    modelUUID
  ]);
  const modelStatusData = useSelector(getModelStatusMemo);

  useEffect(() => {
    dispatch(collapsibleSidebar(true));
    return () => {
      dispatch(collapsibleSidebar(false));
    };
  }, [dispatch]);

  useEffect(() => {
    if (modelUUID !== null && modelStatusData === null) {
      // This model may not be in the first batch of models that we request
      // status from in the main loop so update the status now.
      dispatch(fetchModelStatus(modelUUID));
    }
  }, [dispatch, modelUUID, modelStatusData]);

  const viewFilters = ["all", "apps", "units", "machines", "relations"];
  const statusFilters = ["all", "maintenance", "blocked"];

  const applicationTableRows = useMemo(
    () => generateApplicationRows(modelStatusData),
    [modelStatusData]
  );
  const unitTableRows = useMemo(() => generateUnitRows(modelStatusData), [
    modelStatusData
  ]);
  const relationTableRows = useMemo(
    () => generateRelationRows(modelStatusData),
    [modelStatusData]
  );
  const machinesTableRows = useMemo(
    () => generateMachineRows(modelStatusData),
    [modelStatusData]
  );

  return (
    <Layout>
      <Header>
        <div className="model-details__header">
          <strong>{modelStatusData ? modelStatusData.model.name : ""}</strong>
          <div className="model-details__filters">
            <Filter label="View:" filters={viewFilters} />
            <Filter label="Status:" filters={statusFilters} />
          </div>
          <UserIcon />
        </div>
      </Header>
      <div className="l-content">
        <div className="model-details">
          <InfoPanel />
          <div className="model-details__main">
            <MainTable
              headers={applicationTableHeaders}
              rows={applicationTableRows}
              className="model-details__apps"
              sortable
            />
            <MainTable
              headers={unitTableHeaders}
              rows={unitTableRows}
              className="model-details__units"
              sortable
            />
            <MainTable
              headers={machineTableHeaders}
              rows={machinesTableRows}
              className="model-details__machines"
              sortable
            />
            <MainTable
              headers={relationTableHeaders}
              rows={relationTableRows}
              className="model-details__relations"
              sortable
            />
          </div>
        </div>
      </div>
      <Terminal
        address="wss://shell.jujugui.org:443/ws/"
        modelName={modelName}
      />
    </Layout>
  );
};

export default ModelDetails;
