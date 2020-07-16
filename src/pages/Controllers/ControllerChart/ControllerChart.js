import React from "react";

import DonutChart from "components/DonutChart/DonutChart";

import { pluralize } from "app/utils";

import "./_controller-chart.scss";

export default function ControllerChart({ chartData, totalLabel }) {
  const totalCount = chartData.blocked + chartData.alert + chartData.running;
  return (
    <div className="p-chart">
      <div className="p-chart__chart">
        <DonutChart chartData={chartData} />
      </div>
      <div className="p-chart__legend">
        <ul className="p-list p-legend">
          <li
            className="p-list__item p-legend__item label"
            data-test="legend-label"
          >
            <strong data-test="total-count">
              {totalCount} {pluralize(totalCount, totalLabel)}
            </strong>
          </li>
          <li
            className="p-list__item p-legend__item is-blocked"
            data-test="legend-blocked"
          >
            Blocked: {chartData.blocked || 0}
          </li>
          <li
            className="p-list__item p-legend__item is-alert"
            data-test="legend-alert"
          >
            Alerts: {chartData.alert || 0}
          </li>
          <li
            className="p-list__item p-legend__item is-running"
            data-test="legend-running"
          >
            Running: {chartData.running || 0}
          </li>
        </ul>
      </div>
    </div>
  );
}
