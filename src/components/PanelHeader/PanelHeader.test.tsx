import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { usePanelQueryParams } from "panels/hooks";
import { renderComponent } from "testing/utils";

import PanelHeader from "./PanelHeader";

describe("PanelHeader", () => {
  const mockRenderComponent = ({ url }: { url: string }) => {
    const MockPanelHeader = (): JSX.Element => {
      const [, , handleRemovePanelQueryParams] = usePanelQueryParams<{
        panel: null | string;
        model: null | string;
      }>({
        panel: null,
        model: null,
      });

      return (
        <PanelHeader
          id="mockID"
          title="Title"
          onRemovePanelQueryParams={handleRemovePanelQueryParams}
        />
      );
    };

    return renderComponent(<MockPanelHeader />, { url });
  };

  it("should render the supplied title", () => {
    mockRenderComponent({
      url: "/mockPath?model=cmr&panel=share-model",
    });
    expect(screen.getByText("Title")).toHaveClass("p-panel__title");
  });

  it("should only remove panel query params after close button is clicked", async () => {
    mockRenderComponent({
      url: "/models?model=cmr&panel=share-model&externalParam=externalValue",
    });

    const searchParamsBeforeClose = new URLSearchParams(window.location.search);
    expect(searchParamsBeforeClose.get("panel")).toEqual("share-model");
    expect(searchParamsBeforeClose.get("model")).toEqual("cmr");
    expect(searchParamsBeforeClose.get("externalParam")).toEqual(
      "externalValue"
    );

    await userEvent.click(screen.getByRole("button"));

    const searchParamsAfterClose = new URLSearchParams(window.location.search);
    expect(searchParamsAfterClose.get("panel")).toEqual(null);
    expect(searchParamsAfterClose.get("model")).toEqual(null);
    expect(searchParamsAfterClose.get("externalParam")).toEqual(
      "externalValue"
    );
  });
});
