import React from "react";
import { useSelector } from "react-redux";

import Layout from "components/Layout/Layout";
import DonutChart from "components/DonutChart/DonutChart";
import MainTable from "@canonical/react-components/dist/components/MainTable/MainTable";

import { getControllerData, getModelCounts } from "app/selectors";
import { pluralize } from "app/utils";

import "./_controllers.scss";

export default function Controllers() {
  const controllerData = useSelector(getControllerData);
  const { machinesCount, applicationCount, unitCount } = useSelector(
    getModelCounts
  );
  const {
    machinesBlockedCount,
    machinesAlertCount,
    machinesRunningCount
  } = useSelector(getModelCounts);

  const headers = [
    { content: "running", sortKey: "running" },
    { content: "cloud/region", sortKey: "cloud/region" },
    { content: "models", sortKey: "models", className: "u-align--right" },
    { content: "machines", sortKey: "machines", className: "u-align--right" },
    {
      content: "applications",
      sortKey: "applications",
      className: "u-align--right"
    },
    { content: "units", sortKey: "units", className: "u-align--right" },
    { content: "version", sortKey: "version", className: "u-align--right" },
    { content: "public", sortKey: "public", className: "u-align--right" }
  ];

  const rows =
    controllerData &&
    Object.values(controllerData).map(c => ({
      columns: [
        { content: <a href="_#">{c.path}</a> },
        { content: `${c.location.cloud}/${c.location.region}` },
        { content: "-", className: "u-align--right" },
        { content: "-", className: "u-align--right" },
        { content: "-", className: "u-align--right" },
        { content: "-", className: "u-align--right" },
        { content: "-", className: "u-align--right" },
        { content: `${c.Public}`, className: "u-align--right u-capitalise" }
      ]
    }));

  let machinesChartData = {machinesCount, applicationCount, unitCount};

  return (
    <Layout>
      <div className="l-content controllers">
        <div className="p-strip--light is-shallow overview">
          <div className="row">
            <h5>Model status across controllers</h5>
          </div>
          <div className="row">
            <div className="col-3">
              <DonutChart chartData={machinesChartData} />
              <strong data-test="machine-count">
                {machinesCount} {pluralize(machinesCount, "machine")}
              </strong>
              <ul className="p-list p-legend">
                <li className="p-list__item p-legend__item is-blocked">
                  Blocked: 9
                </li>
                <li className="p-list__item p-legend__item is-alert">
                  Alerts: 20
                </li>
                <li className="p-list__item p-legend__item is-running">
                  Running: 130
                </li>
              </ul>
            </div>
            <div className="col-3 overview__applications">
              {/* <DonutChart /> */}
              <strong data-test="application-count">
                {applicationCount} {pluralize(applicationCount, "application")}
              </strong>
              <ul className="p-list p-legend">
                <li className="p-list__item p-legend__item is-blocked">
                  Blocked: 9
                </li>
                <li className="p-list__item p-legend__item is-alert">
                  Alerts: 20
                </li>
                <li className="p-list__item p-legend__item is-running">
                  Running: 130
                </li>
              </ul>
            </div>
            <div className="col-3 overview__units">
              {/* <DonutChart /> */}
              <strong data-test="unit-count">
                {unitCount} {pluralize(unitCount, "unit")}
              </strong>
              <ul className="p-list p-legend">
                <li className="p-list__item p-legend__item is-blocked">
                  Blocked: 9
                </li>
                <li className="p-list__item p-legend__item is-alert">
                  Alerts: 20
                </li>
                <li className="p-list__item p-legend__item is-running">
                  Running: 130
                </li>
              </ul>
            </div>
            <div className="col-3 overview__units">
              {/* <DonutChart /> */}
              <strong data-test="unit-count">
                {unitCount} {pluralize(unitCount, "unit")}
              </strong>
              <ul className="p-list p-legend">
                <li className="p-list__item p-legend__item is-blocked">
                  Blocked: 9
                </li>
                <li className="p-list__item p-legend__item is-alert">
                  Alerts: 20
                </li>
                <li className="p-list__item p-legend__item is-running">
                  Running: 130
                </li>
              </ul>
            </div>
          </div>
        </div>
        <div className="p-strip">
          <div className="row l-controllers-table">
            <h5>Controller status</h5>
            <MainTable
              className={"u-table-layout--auto"}
              headers={headers}
              rows={rows}
            />
          </div>
        </div>
      </div>
    </Layout>
  );
}
