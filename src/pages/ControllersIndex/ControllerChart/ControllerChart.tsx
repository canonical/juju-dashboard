import DonutChart from "components/DonutChart/DonutChart";
import { pluralize } from "store/juju/utils/models";

import "./_controller-chart.scss";

type Props = {
  alert?: number;
  blocked?: number;
  running?: number;
  totalLabel: string;
};

function getPercentage(denominator: number, numerator: number) {
  if (denominator === 0 || numerator === 0) {
    return 0;
  }
  const trunc = Math.trunc(denominator / numerator);
  if (Number.isNaN(trunc)) {
    return 0;
  }
  return trunc;
}

export default function ControllerChart({
  alert = 0,
  blocked = 0,
  running = 0,
  totalLabel,
}: Props) {
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
