import { render, screen } from "@testing-library/react";

import ControllerChart from "./ControllerChart";

describe("Controllers chart", () => {
  it("supports empty data", () => {
    const chartData = {};
    render(<ControllerChart chartData={chartData} totalLabel="machine" />);
    expect(screen.getByTestId("total-count")).toHaveTextContent("0 machines");
  });

  it("renders the correct counts by status", () => {
    const chartData = { blocked: 5, alert: 10, running: 15 };
    render(<ControllerChart chartData={chartData} totalLabel="machine" />);
    expect(screen.getByTestId("legend-blocked")).toHaveTextContent(
      "Blocked: 6%, 5"
    );
    expect(screen.getByTestId("legend-alert")).toHaveTextContent(
      "Alerts: 3%, 10"
    );
    expect(screen.getByTestId("legend-running")).toHaveTextContent(
      "Running: 2%, 15"
    );
  });
});
