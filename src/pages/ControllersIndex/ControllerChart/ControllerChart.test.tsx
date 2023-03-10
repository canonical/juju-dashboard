import { render, screen } from "@testing-library/react";

import ControllerChart from "./ControllerChart";

describe("Controllers chart", () => {
  it("supports empty data", () => {
    render(<ControllerChart totalLabel="machine" />);
    expect(screen.getByTestId("total-count")).toHaveTextContent("0 machines");
  });

  it("renders the correct counts by status", () => {
    render(
      <ControllerChart
        blocked={5}
        alert={10}
        running={15}
        totalLabel="machine"
      />
    );
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
