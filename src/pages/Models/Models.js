import React from "react";
import { useSelector } from "react-redux";
import { useLocation, useHistory } from "react-router-dom";
import queryString from "query-string";

import Layout from "components/Layout/Layout";
import Header from "components/Header/Header";
import ModelTableList from "components/ModelTableList/ModelTableList";
import ButtonGroup from "components/ButtonGroup/ButtonGroup";

import { SearchAndFilter } from "@canonical/react-components";
import useModelAttributes from "hooks/useModelAttributes";

import useWindowTitle from "hooks/useWindowTitle";

import { useQueryParam, StringParam, withDefault } from "use-query-params";

import { getGroupedModelStatusCounts, getModelData } from "app/selectors";
import { pluralize } from "app/utils";

import "./_models.scss";

export default function Models() {
  useWindowTitle("Models");

  const location = useLocation();
  const history = useHistory();
  let activeFilters = [];

  // Grab filter from 'groupedby' query in URL and assign to variable
  const [groupModelsBy, setGroupModelsBy] = useQueryParam(
    "groupedby",
    withDefault(StringParam, "status")
  );

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

  // Add filter to activeFilters array
  const addFilter = function (type, value) {
    activeFilters[type] = activeFilters[type] || [];
    if (!activeFilters[type].includes(value)) {
      activeFilters[type].push(value);
    }
  };

  // Pull current filters from URl
  const queryStrings = queryString.parse(location.search, {
    arrayFormat: "comma",
  });
  // Iterate current filters from query strings and add to active filters
  for (const [key, value] of Object.entries(queryStrings)) {
    addFilter(key, value);
  }

  const { blocked, alert, running } = useSelector(getGroupedModelStatusCounts);
  const models = blocked + alert + running;

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
                heading: "Credentials",
                chips: generateChips("Credentials", credentials),
              },
            ]}
            returnSearchData={(searchData) => {
              if (searchData.length > 0) {
                // Loop search data and pull out each filter
                searchData.forEach(({ lead = "custom", value }) => {
                  addFilter(lead?.toLowerCase(), value);
                });

                // Construct new query string
                const proposedQueryString = queryString.stringify(
                  activeFilters,
                  {
                    arrayFormat: "comma",
                  }
                );

                // Pull current query string from URL
                const currentQueryString = location.search.split("?")[1];
                // Don't update URL if query strings are unchanged
                if (proposedQueryString !== currentQueryString) {
                  history.push({
                    search: proposedQueryString,
                  });
                }
              }
            }}
          />
        </div>
      </Header>

      <div className="l-content">
        <div className="models">
          <ModelTableList groupedBy={groupModelsBy} filters={activeFilters} />
        </div>
      </div>
    </Layout>
  );
}
