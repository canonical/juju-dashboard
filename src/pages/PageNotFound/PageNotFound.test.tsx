import { screen } from "@testing-library/react";

import { Routes } from "components/Routes/Routes";
import { TestId } from "layout/BaseLayout/BaseLayout";
import { renderComponent } from "testing/utils";

import { Label } from "./PageNotFound";

describe("PageNotFound page", () => {
  it("should display when unknown route is accessed", () => {
    renderComponent(<Routes />, { url: "/foobar11" });
    expect(screen.getByText(Label.NOT_FOUND)).toBeInTheDocument();
    // Ensure only one route is rendered
    expect(screen.getAllByTestId(TestId.MAIN)).toHaveLength(1);
  });
});
