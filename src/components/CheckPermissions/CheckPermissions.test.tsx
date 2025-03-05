import { screen } from "@testing-library/dom";

import { LoadingSpinnerTestId } from "components/LoadingSpinner";
import { PageNotFoundLabel } from "pages/PageNotFound";
import { renderComponent } from "testing/utils";

import CheckPermissions from "./CheckPermissions";

describe("CheckPermissions", () => {
  it("displays the loading state", async () => {
    renderComponent(
      <CheckPermissions loading>secret content</CheckPermissions>,
    );
    expect(
      screen.getByTestId(LoadingSpinnerTestId.LOADING),
    ).toBeInTheDocument();
  });

  it("displays a page not found message if it's not allowed", async () => {
    renderComponent(
      <CheckPermissions allowed={false}>secret content</CheckPermissions>,
    );
    expect(screen.getByText(PageNotFoundLabel.NOT_FOUND)).toBeInTheDocument();
  });

  it("displays a page not found message if it's not allowed", async () => {
    renderComponent(
      <CheckPermissions allowed>secret content</CheckPermissions>,
    );
    expect(screen.getByText("secret content")).toBeInTheDocument();
  });
});
