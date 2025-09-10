import type { JSX } from "react";

import DonutChart from "components/DonutChart";
import { pluralize } from "store/juju/utils/models";

type Props = {
  alert?: number;
  blocked?: number;
  running?: number;
  totalLabel: string;
};

function getPercentage(denominator: number, numerator: number): number {
  if (denominator === 0 || numerator === 0) {
    return 0;
  }
  const percentage = Math.round((numerator / denominator) * 100);
  if (Number.isNaN(percentage)) {
    return 0;
  }
  return percentage;
}

export default function ControllerChart({
  alert = 0,
  blocked = 0,
  running = 0,
  totalLabel,
}: Props): JSX.Element {
  const totalCount = blocked + alert + running;

  return (
    <div className="p-chart">
      <div className="p-chart__chart">
        <DonutChart alert={alert} blocked={blocked} running={running} />
      </div>
      <div className="p-chart__legend">
        <ul className="p-list p-legend">
          <li
            className="p-list__item p-legend__item label"
            data-testid="legend-label"
          >
            <strong data-testid="total-count">
              {totalCount} {pluralize(totalCount, totalLabel)}
            </strong>
          </li>
          <li
            className="p-list__item p-legend__item is-blocked"
            data-testid="legend-blocked"
          >
            Blocked: {getPercentage(totalCount, blocked)}%, {blocked}
          </li>
          <li
            className="p-list__item p-legend__item is-alert"
            data-testid="legend-alert"
          >
            Alerts: {getPercentage(totalCount, alert)}%, {alert}
          </li>
          <li
            className="p-list__item p-legend__item is-running"
            data-testid="legend-running"
          >
            Running: {getPercentage(totalCount, running)}%, {running}
          </li>
        </ul>
      </div>
    </div>
  );
}
