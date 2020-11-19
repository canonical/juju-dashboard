import React from "react";
import { useSelector } from "react-redux";

import Layout from "components/Layout/Layout";
import Header from "components/Header/Header";
import ModelTableList from "components/ModelTableList/ModelTableList";
import ButtonGroup from "components/ButtonGroup/ButtonGroup";

import { SearchAndFilter } from "@canonical/react-components";
import useModelAttributes from "hooks/useModelAttributes";

import useWindowTitle from "hooks/useWindowTitle";

import {
  useQueryParam,
  useQueryParams,
  StringParam,
  ArrayParam,
  withDefault,
} from "use-query-params";

import { getGroupedModelStatusCounts, getModelData } from "app/selectors";
import { pluralize } from "app/utils";

import "./_models.scss";

export default function Models() {
  useWindowTitle("Models");
  // Grab filter from 'groupedby' query in URL and assign to variable
  const [groupModelsBy, setGroupModelsBy] = useQueryParam(
    "groupedby",
    withDefault(StringParam, "status")
  );

  const [filters, setFilters] = useQueryParams({
    cloud: withDefault(ArrayParam, []),
    owner: withDefault(ArrayParam, []),
    region: withDefault(ArrayParam, []),
    credential: withDefault(ArrayParam, []),
    custom: withDefault(ArrayParam, []),
  });

  // loop model data and pull out filter panel data
  const modelData = useSelector(getModelData);
  const { clouds, regions, owners, credentials } = useModelAttributes(
    modelData
  );

  // Generate chips from available model data
  const generateChips = (lead, values) => {
    let chipValues = [];
    values.forEach((value) => {
      chipValues.push({ lead, value });
    });
    return chipValues;
  };

  const { blocked, alert, running } = useSelector(getGroupedModelStatusCounts);
  const models = blocked + alert + running;

  let activeFilters = {};

  const isObjectsEqual = (obj1, obj2) =>
    JSON.stringify(obj1) === JSON.stringify(obj2);

  const existingSearchData = [];
  for (const [lead, values] of Object.entries(filters)) {
    values.forEach((value) => {
      existingSearchData.push({ lead, value });
    });
  }

  return (
    <Layout>
      <Header>
        <div className="models__header">
          <div className="models__count">
            {`${models} ${pluralize(
              models,
              "model"
            )}: ${blocked} blocked, ${alert} ${pluralize(
              alert,
              "alert"
            )}, ${running} running`}
          </div>
          <ButtonGroup
            activeButton={groupModelsBy}
            buttons={["status", "cloud", "owner"]}
            label="Group by:"
            setActiveButton={setGroupModelsBy}
          />
          <SearchAndFilter
            filterPanelData={[
              {
                id: 0,
                heading: "Cloud",
                chips: generateChips("Cloud", clouds),
              },
              {
                id: 1,
                heading: "Region",
                chips: generateChips("Region", regions),
              },
              {
                id: 2,
                heading: "Owner",
                chips: generateChips("Owner", owners),
              },
              {
                id: 3,
                heading: "Credential",
                chips: generateChips("Credential", credentials),
              },
            ]}
            existingSearchData={existingSearchData}
            returnSearchData={(searchData) => {
              // Reset active filters
              activeFilters = {
                cloud: [],
                owner: [],
                region: [],
                credential: [],
                custom: [],
              };

              // Loop search data and pull out each filter
              searchData.length &&
                searchData.forEach(({ lead, value }) => {
                  const chipLead = lead ? lead.toLowerCase() : "custom";
                  if (!activeFilters[chipLead]) {
                    activeFilters[chipLead] = [];
                  }
                  activeFilters[chipLead].push(value);
                });

              if (!isObjectsEqual(activeFilters, filters)) {
                setFilters(activeFilters);
              }
            }}
          />
        </div>
      </Header>

      <div className="l-content">
        <div className="models">
          <ModelTableList groupedBy={groupModelsBy} filters={filters} />
        </div>
      </div>
    </Layout>
  );
}
