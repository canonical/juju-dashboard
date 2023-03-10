import { render } from "@testing-library/react";

import DonutChart from "./DonutChart";

describe("Donut chart", () => {
  it("renders appropriate segments if data available", () => {
    render(<DonutChart blocked={1} alert={1} running={1} />);
    const svg = document.querySelector("svg");
    expect(svg?.querySelector(".is-blocked")).toBeInTheDocument();
    expect(svg?.querySelector(".is-alert")).toBeInTheDocument();
    expect(svg?.querySelector(".is-running")).toBeInTheDocument();
    expect(svg?.querySelector(".is-disabled")).not.toBeInTheDocument();
  });

  it("renders as disabled if no data available", () => {
    render(<DonutChart blocked={0} alert={0} running={0} />);
    const svg = document.querySelector("svg");
    expect(svg?.querySelector(".is-blocked")).not.toBeInTheDocument();
    expect(svg?.querySelector(".is-alert")).not.toBeInTheDocument();
    expect(svg?.querySelector(".is-running")).not.toBeInTheDocument();
    expect(svg?.querySelector(".is-disabled")).toBeInTheDocument();
  });
});
