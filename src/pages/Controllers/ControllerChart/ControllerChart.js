import React from "react";

import DonutChart from "components/DonutChart/DonutChart";

import { pluralize } from "app/utils";

import "./_controller-chart.scss";

export default function ControllerChart({ chartData, totalLabel }) {
  const totalCount =
    chartData.blocked || 0 + chartData.alert || 0 + chartData.running || 0;
  return (
    <div className="p-chart">
      <div className="p-chart__chart">
        <DonutChart chartData={chartData} />
      </div>
      <div className="p-chart__legend">
        <p>
          <strong data-test="total-count">
            {totalCount} {pluralize(totalCount, totalLabel)}
          </strong>
        </p>
        <ul className="p-list p-legend">
          <li
            className="p-list__item p-legend__item is-blocked"
            data-test="legend-blocked"
          >
            Blocked: {chartData.blocked}
          </li>
          <li
            className="p-list__item p-legend__item is-alert"
            data-test="legend-alert"
          >
            Alerts: {chartData.alert}
          </li>
          <li
            className="p-list__item p-legend__item is-running"
            data-test="legend-running"
          >
            Running: {chartData.running}
          </li>
        </ul>
      </div>
    </div>
  );
}
