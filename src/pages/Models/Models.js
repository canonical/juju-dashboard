import React from "react";
import { useSelector } from "react-redux";
import { useLocation } from "react-router-dom";
import queryString from "query-string";

import Layout from "components/Layout/Layout";
import Header from "components/Header/Header";
import ModelTableList from "components/ModelTableList/ModelTableList";
import ButtonGroup from "components/ButtonGroup/ButtonGroup";

import SearchAndFilter from "@canonical/react-components/dist/components/SearchAndFilter";

import useWindowTitle from "hooks/useWindowTitle";

import { useQueryParam, StringParam, withDefault } from "use-query-params";

import { getGroupedModelStatusCounts } from "app/selectors";
import { pluralize } from "app/utils";

import "./_models.scss";

export default function Models() {
  useWindowTitle("Models");

  const [groupModelsBy, setGroupModelsBy] = useQueryParam(
    "groupedby",
    withDefault(StringParam, "status")
  );

  // Grab filter from 'groupedby' query in URL and assign to variable
  const location = useLocation();
  const queryStrings = queryString.parse(location.search, {
    arrayFormat: "comma",
  });
  let activeFilters = queryStrings.activeFilters;
  if (typeof activeFilters === "string") {
    // Maintain a consistent type returned from the parsing of the querystring.
    activeFilters = [activeFilters];
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
                chips: [
                  { lead: "Cloud", value: "Google" },
                  { lead: "Cloud", value: "AWS" },
                  { lead: "Cloud", value: "Azure" },
                ],
              },
              {
                id: 1,
                heading: "Region",
                chips: [
                  { lead: "Region", value: "us-east1" },
                  { lead: "Region", value: "us-north2" },
                  { lead: "Region", value: "us-south3" },
                  { lead: "Region", value: "us-north4" },
                  { lead: "Region", value: "us-east5" },
                  { lead: "Region", value: "us-south6" },
                  { lead: "Region", value: "us-east7" },
                  { lead: "Region", value: "us-east8" },
                  { lead: "Region", value: "us-east9" },
                  { lead: "Region", value: "us-east10" },
                ],
              },
              {
                id: 2,
                heading: "Owner",
                chips: [
                  { lead: "Owner", value: "foo" },
                  { lead: "Owner", value: "bar" },
                  { lead: "Owner", value: "baz" },
                ],
              },
            ]}
            returnSearchData={(searchData) => {
              if (searchData.length > 0) {
                // do something
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
