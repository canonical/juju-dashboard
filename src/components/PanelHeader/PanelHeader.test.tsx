import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { renderComponent } from "testing/utils";

import PanelHeader from "./PanelHeader";

describe("PanelHeader", () => {
  it("Renders the supplied title", () => {
    const title = "My Title";
    renderComponent(<PanelHeader id="123" title={title} />, {
      url: "/models/user-eggman@external/new-search-aggregate",
    });
    expect(screen.getByText(title)).toHaveClass("p-panel__title");
  });

  it("Removes all query params when close button clicked", async () => {
    renderComponent(<PanelHeader id="123" title="Title" />, {
      url: "/models?model=cmr&panel=share-model",
    });
    const searchParams = new URLSearchParams(window.location.search);
    expect(searchParams.get("panel")).toEqual("share-model");
    expect(searchParams.get("model")).toEqual("cmr");
    await userEvent.click(screen.getByRole("button"));
    const searchParamsAfterClose = new URLSearchParams(window.location.search);
    expect(searchParamsAfterClose.get("panel")).toEqual(null);
    expect(searchParamsAfterClose.get("model")).toEqual(null);
  });
});
