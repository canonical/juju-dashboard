import { screen } from "@testing-library/react";

import { Routes } from "components/Routes/Routes";
import { BaseLayoutTestId } from "layout/BaseLayout";
import { renderComponent } from "testing/utils";

import { Label } from "./types";

describe("PageNotFound page", () => {
  it("should display when unknown route is accessed", () => {
    renderComponent(<Routes />, { url: "/foobar11" });
    expect(screen.getByText(Label.NOT_FOUND)).toBeInTheDocument();
    // Ensure only one route is rendered
    expect(screen.getAllByTestId(BaseLayoutTestId.MAIN)).toHaveLength(1);
  });
});
