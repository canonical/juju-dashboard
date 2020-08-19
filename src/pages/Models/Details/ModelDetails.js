import React, { useEffect, useMemo, useState } from "react";
import MainTable from "@canonical/react-components/dist/components/MainTable";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router-dom";

import Filter from "components/Filter/Filter";
import InfoPanel from "components/InfoPanel/InfoPanel";
import Layout from "components/Layout/Layout";
import Header from "components/Header/Header";
import SlidePanel from "components/SlidePanel/SlidePanel";

import { getConfig, getModelUUID, getModelStatus } from "app/selectors";
import { fetchModelStatus } from "juju/actions";
import { collapsibleSidebar } from "ui/actions";

import {
  applicationTableHeaders,
  unitTableHeaders,
  machineTableHeaders,
  relationTableHeaders,
  generateApplicationRows,
  generateMachineRows,
  generateRelationRows,
  generateUnitRows,
} from "./generators";

import "./_model-details.scss";

const ModelDetails = () => {
  const { 0: modelName } = useParams();
  const dispatch = useDispatch();

  const [viewFilterToggle, setViewFilterToggle] = useState({ all: true });

  const [slidePanelData, setSlidePanelData] = useState({});

  const getModelUUIDMemo = useMemo(() => getModelUUID(modelName), [modelName]);
  const modelUUID = useSelector(getModelUUIDMemo);
  const getModelStatusMemo = useMemo(() => getModelStatus(modelUUID), [
    modelUUID,
  ]);
  const modelStatusData = useSelector(getModelStatusMemo);

  const { baseAppURL } = useSelector(getConfig);

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

  const handleRowClick = (e) => {
    const currentTarget = e.currentTarget;
    setSlidePanelData({ app: currentTarget.dataset.app });
  };

  const viewFilters = ["all", "apps", "units", "machines", "relations"];

  const applicationTableRows = useMemo(
    () => generateApplicationRows(modelStatusData, handleRowClick, baseAppURL),
    [baseAppURL, modelStatusData]
  );
  const unitTableRows = useMemo(
    () => generateUnitRows(modelStatusData, baseAppURL),
    [baseAppURL, modelStatusData]
  );
  const machinesTableRows = useMemo(
    () => generateMachineRows(modelStatusData),
    [modelStatusData]
  );
  const relationTableRows = useMemo(
    () => generateRelationRows(modelStatusData, baseAppURL),
    [baseAppURL, modelStatusData]
  );

  return (
    <Layout>
      <Header>
        <div className="model-details__header">
          <strong className="model-details__title">
            {modelStatusData ? modelStatusData.model.name : "..."}
          </strong>
          <div className="model-details__filters">
            <Filter
              label="View:"
              filters={viewFilters}
              setFilterToggle={setViewFilterToggle}
              filterToggle={viewFilterToggle}
            />
          </div>
        </div>
      </Header>
      <div className="l-content">
        <div className="model-details">
          <InfoPanel />
          <div className="model-details__main u-overflow--scroll">
            {(viewFilterToggle.all === true ||
              viewFilterToggle.apps === true) && (
              <MainTable
                headers={applicationTableHeaders}
                rows={applicationTableRows}
                className="model-details__apps p-main-table"
                sortable
                emptyStateMsg={"There are no applications in this model"}
              />
            )}
            {(viewFilterToggle.all === true ||
              viewFilterToggle.units === true) && (
              <MainTable
                headers={unitTableHeaders}
                rows={unitTableRows}
                className="model-details__units p-main-table"
                sortable
                emptyStateMsg={"There are no units in this model"}
              />
            )}
            {(viewFilterToggle.all === true ||
              viewFilterToggle.machines === true) && (
              <MainTable
                headers={machineTableHeaders}
                rows={machinesTableRows}
                className="model-details__machines p-main-table"
                sortable
                emptyStateMsg={"There are no machines in this model"}
              />
            )}
            {(viewFilterToggle.all === true ||
              viewFilterToggle.relations === true) && (
              <MainTable
                headers={relationTableHeaders}
                rows={relationTableRows}
                className="model-details__relations p-main-table"
                sortable
                emptyStateMsg={"There are no relations in this model"}
              />
            )}
          </div>
        </div>
        <SlidePanel
          isActive={Object.entries(slidePanelData).length}
          onClose={() => setSlidePanelData({})}
        >
          <h3>{slidePanelData.app}</h3>
        </SlidePanel>
      </div>
    </Layout>
  );
};

export default ModelDetails;
