import type { JSX } from "react";

import DonutChart from "components/DonutChart";
import { pluralize } from "store/juju/utils/models";
import { testId } from "testing/utils";

import { TestId } from "./types";

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
            {...testId(TestId.LEGEND_LABEL)}
          >
            <strong {...testId(TestId.TOTAL_COUNT)}>
              {totalCount} {pluralize(totalCount, totalLabel)}
            </strong>
          </li>
          <li
            className="p-list__item p-legend__item is-blocked"
            {...testId(TestId.LEGEND_BLOCKED)}
          >
            Blocked: {getPercentage(totalCount, blocked)}%, {blocked}
          </li>
          <li
            className="p-list__item p-legend__item is-alert"
            {...testId(TestId.LEGEND_ALERT)}
          >
            Alerts: {getPercentage(totalCount, alert)}%, {alert}
          </li>
          <li
            className="p-list__item p-legend__item is-running"
            {...testId(TestId.LEGEND_RUNNING)}
          >
            Running: {getPercentage(totalCount, running)}%, {running}
          </li>
        </ul>
      </div>
    </div>
  );
}
