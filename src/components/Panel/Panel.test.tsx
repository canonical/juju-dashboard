import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { renderComponent } from "testing/utils";

import Panel from "./Panel";

describe("Panel", () => {
  const url = "/foo?panel=share-model";

  it("displays the title and content", async () => {
    renderComponent(
      <Panel panelClassName="test-panel" title="Test panel">
        <>Test content</>
      </Panel>,
      { url }
    );
    expect(screen.getByText("Test panel")).toBeInTheDocument();
    expect(screen.getByText("Test content")).toBeInTheDocument();
  });

  it("should give the panel a class name", async () => {
    renderComponent(
      <Panel panelClassName="test-panel" title="Test panel">
        <>Test content</>
      </Panel>,
      { url }
    );
    expect(document.querySelector(".p-panel")).toHaveClass("test-panel");
  });

  it("should clear the search params when escape key is pressed", async () => {
    renderComponent(
      <Panel panelClassName="test-panel" title="Test panel">
        <>Test content</>
      </Panel>,
      { url }
    );
    expect(window.location.pathname).toBe("/foo");
    expect(window.location.search).toBe("?panel=share-model");
    await userEvent.type(window.document.documentElement, "{Escape}", {
      skipClick: true,
    });
    expect(window.location.pathname).toBe("/foo");
    expect(window.location.search).toBe("");
  });

  it("should not close if another key is pressed", async () => {
    renderComponent(
      <Panel panelClassName="test-panel" title="Test panel">
        <>Test content</>
      </Panel>,
      { url }
    );
    expect(window.location.pathname).toBe("/foo");
    expect(window.location.search).toBe("?panel=share-model");
    await userEvent.type(window.document.documentElement, "{Enter}", {
      skipClick: true,
    });
    expect(window.location.pathname).toBe("/foo");
    expect(window.location.search).toBe("?panel=share-model");
  });

  it("should check if it can close when escape key is pressed", async () => {
    renderComponent(
      <Panel
        checkCanClose={() => false}
        panelClassName="test-panel"
        title="Test panel"
      >
        <>Test content</>
      </Panel>,
      { url }
    );
    expect(window.location.pathname).toBe("/foo");
    expect(window.location.search).toBe("?panel=share-model");
    await userEvent.type(window.document.documentElement, "{Escape}", {
      skipClick: true,
    });
    expect(window.location.pathname).toBe("/foo");
    expect(window.location.search).toBe("?panel=share-model");
  });

  it("should clear the search params when clicking outside the panel", async () => {
    renderComponent(
      <Panel panelClassName="test-panel" title="Test panel">
        <>Test content</>
      </Panel>,
      { url }
    );
    expect(window.location.pathname).toBe("/foo");
    expect(window.location.search).toBe("?panel=share-model");
    await userEvent.click(window.document.documentElement);
    expect(window.location.pathname).toBe("/foo");
    expect(window.location.search).toBe("");
  });

  it("should not clear the search params when clicking inside the panel", async () => {
    renderComponent(
      <Panel panelClassName="test-panel" title="Test panel">
        <>Test content</>
      </Panel>,
      { url }
    );
    expect(window.location.pathname).toBe("/foo");
    expect(window.location.search).toBe("?panel=share-model");
    await userEvent.click(screen.getByText("Test content"));
    expect(window.location.pathname).toBe("/foo");
    expect(window.location.search).toBe("?panel=share-model");
  });

  it("should check if it can close when clicking inside the panel", async () => {
    renderComponent(
      <Panel
        checkCanClose={() => false}
        panelClassName="test-panel"
        title="Test panel"
      >
        <>Test content</>
      </Panel>,
      { url }
    );
    expect(window.location.pathname).toBe("/foo");
    expect(window.location.search).toBe("?panel=share-model");
    await userEvent.click(window.document.documentElement);
    expect(window.location.pathname).toBe("/foo");
    expect(window.location.search).toBe("?panel=share-model");
  });
});
