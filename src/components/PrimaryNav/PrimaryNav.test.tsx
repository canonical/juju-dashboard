import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import configureStore from "redux-mock-store";
import { Provider } from "react-redux";
import dataDump from "testing/complete-redux-store-dump";
import cloneDeep from "clone-deep";

import PrimaryNav from "./PrimaryNav";

const mockStore = configureStore([]);
describe("Primary Nav", () => {
  it("applies is-selected state correctly", () => {
    const store = mockStore(dataDump);
    render(
      <Provider store={store}>
        <MemoryRouter initialEntries={["/controllers"]}>
          <PrimaryNav />
        </MemoryRouter>
      </Provider>
    );
    expect(screen.getByRole("link", { name: "Controllers" })).toHaveClass(
      "is-selected"
    );
  });

  it("displays correct number of blocked models", () => {
    const store = mockStore(dataDump);
    render(
      <Provider store={store}>
        <MemoryRouter initialEntries={["/"]}>
          <PrimaryNav />
        </MemoryRouter>
      </Provider>
    );
    expect(screen.getByText("4")).toHaveClass("entity-count");
  });

  it("displays the JAAS logo under JAAS", () => {
    const store = mockStore(dataDump);
    render(
      <Provider store={store}>
        <MemoryRouter initialEntries={["/"]}>
          <PrimaryNav />
        </MemoryRouter>
      </Provider>
    );
    const logo = screen.getByAltText("Juju logo");
    expect(logo).toHaveAttribute("src", "jaas-text.svg");
    expect(logo).toHaveClass("logo__text");
    expect(document.querySelector(".logo")).toHaveAttribute(
      "href",
      "https://jaas.ai"
    );
  });

  it("displays the Juju logo under Juju", () => {
    const clonedDump = cloneDeep(dataDump);
    clonedDump.general.config.isJuju = true;
    const store = mockStore(clonedDump);
    render(
      <Provider store={store}>
        <MemoryRouter initialEntries={["/"]}>
          <PrimaryNav />
        </MemoryRouter>
      </Provider>
    );
    const logo = screen.getByAltText("Juju logo");
    expect(logo).toHaveAttribute("src", "juju-text.svg");
    expect(logo).toHaveClass("logo__text");
    expect(document.querySelector(".logo")).toHaveAttribute(
      "href",
      "https://juju.is"
    );
  });

  it("displays the version number", () => {
    const store = mockStore(dataDump);
    render(
      <Provider store={store}>
        <MemoryRouter initialEntries={["/"]}>
          <PrimaryNav />
        </MemoryRouter>
      </Provider>
    );
    expect(screen.getByText("Version 0.4.0")).toHaveClass("version");
  });
});
