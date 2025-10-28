import { render, screen } from "@testing-library/react";

import ControllerChart from "./ControllerChart";
import { TestId } from "./types";

describe("Controllers chart", () => {
  it("supports empty data", () => {
    render(<ControllerChart totalLabel="machine" />);
    expect(screen.getByTestId(TestId.TOTAL_COUNT)).toHaveTextContent(
      "0 machines",
    );
  });

  it("renders the correct counts by status", () => {
    render(
      <ControllerChart
        blocked={5}
        alert={10}
        running={15}
        totalLabel="machine"
      />,
    );
    expect(screen.getByTestId(TestId.LEGEND_BLOCKED)).toHaveTextContent(
      "Blocked: 17%, 5",
    );
    expect(screen.getByTestId(TestId.LEGEND_ALERT)).toHaveTextContent(
      "Alerts: 33%, 10",
    );
    expect(screen.getByTestId(TestId.LEGEND_RUNNING)).toHaveTextContent(
      "Running: 50%, 15",
    );
  });
});
