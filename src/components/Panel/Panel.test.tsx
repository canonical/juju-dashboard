import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { BrowserRouter } from "react-router-dom";

import Panel from "./Panel";

describe("Panel", () => {
  it("displays the title and content", async () => {
    window.history.pushState({}, "", "/foo?panel=share-model");
    render(
      <BrowserRouter>
        <Panel panelClassName="test-panel" title="Test panel">
          <>Test content</>
        </Panel>
      </BrowserRouter>
    );
    expect(screen.getByText("Test panel")).toBeInTheDocument();
    expect(screen.getByText("Test content")).toBeInTheDocument();
  });

  it("should give the panel a class name", async () => {
    window.history.pushState({}, "", "/foo?panel=share-model");
    render(
      <BrowserRouter>
        <Panel panelClassName="test-panel" title="Test panel">
          <>Test content</>
        </Panel>
      </BrowserRouter>
    );
    expect(document.querySelector(".p-panel")).toHaveClass("test-panel");
  });

  it("should clear the search params when escape key is pressed", async () => {
    window.history.pushState({}, "", "/foo?panel=share-model");
    render(
      <BrowserRouter>
        <Panel panelClassName="test-panel" title="Test panel">
          <>Test content</>
        </Panel>
      </BrowserRouter>
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
    window.history.pushState({}, "", "/foo?panel=share-model");
    render(
      <BrowserRouter>
        <Panel panelClassName="test-panel" title="Test panel">
          <>Test content</>
        </Panel>
      </BrowserRouter>
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
    window.history.pushState({}, "", "/foo?panel=share-model");
    render(
      <BrowserRouter>
        <Panel
          checkCanClose={() => false}
          panelClassName="test-panel"
          title="Test panel"
        >
          <>Test content</>
        </Panel>
      </BrowserRouter>
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
    window.history.pushState({}, "", "/foo?panel=share-model");
    render(
      <BrowserRouter>
        <Panel panelClassName="test-panel" title="Test panel">
          <>Test content</>
        </Panel>
      </BrowserRouter>
    );
    expect(window.location.pathname).toBe("/foo");
    expect(window.location.search).toBe("?panel=share-model");
    await userEvent.click(window.document.documentElement);
    expect(window.location.pathname).toBe("/foo");
    expect(window.location.search).toBe("");
  });

  it("should not clear the search params when clicking inside the panel", async () => {
    window.history.pushState({}, "", "/foo?panel=share-model");
    render(
      <BrowserRouter>
        <Panel panelClassName="test-panel" title="Test panel">
          <>Test content</>
        </Panel>
      </BrowserRouter>
    );
    expect(window.location.pathname).toBe("/foo");
    expect(window.location.search).toBe("?panel=share-model");
    await userEvent.click(screen.getByText("Test content"));
    expect(window.location.pathname).toBe("/foo");
    expect(window.location.search).toBe("?panel=share-model");
  });

  it("should check if it can close when clicking inside the panel", async () => {
    window.history.pushState({}, "", "/foo?panel=share-model");
    render(
      <BrowserRouter>
        <Panel
          checkCanClose={() => false}
          panelClassName="test-panel"
          title="Test panel"
        >
          <>Test content</>
        </Panel>
      </BrowserRouter>
    );
    expect(window.location.pathname).toBe("/foo");
    expect(window.location.search).toBe("?panel=share-model");
    await userEvent.click(window.document.documentElement);
    expect(window.location.pathname).toBe("/foo");
    expect(window.location.search).toBe("?panel=share-model");
  });
});
