import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { usePanelQueryParams } from "panels/hooks";
import { renderComponent } from "testing/utils";

import Panel from "./Panel";

describe("Panel", () => {
  const mockCheckCanClose = () => false;
  const mockRenderComponent = ({
    checkCanClose,
  }: {
    checkCanClose?: (
      e: KeyboardEvent | React.MouseEvent<Element, MouseEvent>
    ) => boolean;
  }) => {
    const MockPanelHeader = (): JSX.Element => {
      const [, , handleRemovePanelQueryParams] = usePanelQueryParams<{
        panel: null | string;
      }>({ panel: null });

      return (
        <Panel
          checkCanClose={checkCanClose}
          panelClassName="test-panel"
          title="Test panel"
          onRemovePanelQueryParams={handleRemovePanelQueryParams}
        >
          <>Test content</>
        </Panel>
      );
    };

    return renderComponent(<MockPanelHeader />, {
      url: "/foo?panel=share-model&externalParam=externalValue",
    });
  };

  it("should display the title and content", async () => {
    mockRenderComponent({});

    expect(screen.getByText("Test panel")).toBeInTheDocument();
    expect(screen.getByText("Test content")).toBeInTheDocument();
  });

  it("should give the panel a class name", async () => {
    mockRenderComponent({});

    expect(document.querySelector(".p-panel")).toHaveClass("test-panel");
  });

  it("should clear only the panel params when escape key is pressed", async () => {
    mockRenderComponent({});

    expect(window.location.pathname).toBe("/foo");
    expect(window.location.search).toBe(
      "?panel=share-model&externalParam=externalValue"
    );

    await userEvent.type(window.document.documentElement, "{Escape}", {
      skipClick: true,
    });

    expect(window.location.pathname).toBe("/foo");
    expect(window.location.search).toBe("?externalParam=externalValue");
  });

  it("should not close if another key is pressed", async () => {
    mockRenderComponent({});

    expect(window.location.pathname).toBe("/foo");
    expect(window.location.search).toBe(
      "?panel=share-model&externalParam=externalValue"
    );

    await userEvent.type(window.document.documentElement, "{Enter}", {
      skipClick: true,
    });

    expect(window.location.pathname).toBe("/foo");
    expect(window.location.search).toBe(
      "?panel=share-model&externalParam=externalValue"
    );
  });

  it("should check if it can close when escape key is pressed", async () => {
    mockRenderComponent({ checkCanClose: mockCheckCanClose });

    expect(window.location.pathname).toBe("/foo");
    expect(window.location.search).toBe(
      "?panel=share-model&externalParam=externalValue"
    );

    await userEvent.type(window.document.documentElement, "{Escape}", {
      skipClick: true,
    });

    expect(window.location.pathname).toBe("/foo");
    expect(window.location.search).toBe(
      "?panel=share-model&externalParam=externalValue"
    );
  });

  it("should only clear the panel params when clicking outside the panel", async () => {
    mockRenderComponent({});

    expect(window.location.pathname).toBe("/foo");
    expect(window.location.search).toBe(
      "?panel=share-model&externalParam=externalValue"
    );

    await userEvent.click(window.document.documentElement);

    expect(window.location.pathname).toBe("/foo");
    expect(window.location.search).toBe("?externalParam=externalValue");
  });

  it("should not clear the search params when clicking inside the panel", async () => {
    mockRenderComponent({});

    expect(window.location.pathname).toBe("/foo");
    expect(window.location.search).toBe(
      "?panel=share-model&externalParam=externalValue"
    );

    await userEvent.click(screen.getByText("Test content"));

    expect(window.location.pathname).toBe("/foo");
    expect(window.location.search).toBe(
      "?panel=share-model&externalParam=externalValue"
    );
  });

  it("should check if it can close when clicking outside the panel", async () => {
    mockRenderComponent({ checkCanClose: mockCheckCanClose });

    expect(window.location.pathname).toBe("/foo");
    expect(window.location.search).toBe(
      "?panel=share-model&externalParam=externalValue"
    );

    await userEvent.click(window.document.documentElement);

    expect(window.location.pathname).toBe("/foo");
    expect(window.location.search).toBe(
      "?panel=share-model&externalParam=externalValue"
    );
  });
});
