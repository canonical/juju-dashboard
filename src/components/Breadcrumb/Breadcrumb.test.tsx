import configureStore from "redux-mock-store";
import { Provider } from "react-redux";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { render, screen } from "@testing-library/react";

import { rootStateFactory } from "testing/factories/root";

import Breadcrumb from "./Breadcrumb";

const mockStore = configureStore([]);

describe("Breadcrumb", () => {
  it("displays correctly on model details", () => {
    const store = mockStore(rootStateFactory.build());
    render(
      <Provider store={store}>
        <MemoryRouter initialEntries={["/models/eggman@external/group-test"]}>
          <Routes>
            <Route
              path="/models/:userName/:modelName"
              element={<Breadcrumb />}
            />
          </Routes>
        </MemoryRouter>
      </Provider>
    );
    expect(
      screen.queryByTestId("breadcrumb-application")
    ).not.toBeInTheDocument();
    expect(screen.getByTestId("breadcrumb-model")).toHaveTextContent(
      "group-test"
    );
  });

  it("displays correctly on application details", () => {
    const store = mockStore(rootStateFactory.build());
    render(
      <Provider store={store}>
        <MemoryRouter
          initialEntries={["/models/eggman@external/group-test/app/easyrsa"]}
        >
          <Routes>
            <Route
              path="/models/:userName/:modelName/app/:appName"
              element={<Breadcrumb />}
            />
          </Routes>
        </MemoryRouter>
      </Provider>
    );
    expect(screen.getByTestId("breadcrumb-items")).toHaveTextContent(
      "group-testApplicationseasyrsa"
    );
    expect(screen.getByTestId("breadcrumb-model")).toHaveTextContent(
      "group-test"
    );
    expect(screen.getByTestId("breadcrumb-section")).toHaveTextContent(
      "Applications"
    );
    expect(screen.getByTestId("breadcrumb-applications")).toHaveTextContent(
      "easyrsa"
    );
  });

  it("displays correctly on unit details", () => {
    const store = mockStore(rootStateFactory.build());
    render(
      <Provider store={store}>
        <MemoryRouter
          initialEntries={[
            "/models/eggman@external/group-test/app/logstash/unit/logstash-0",
          ]}
        >
          <Routes>
            <Route
              path="/models/:userName/:modelName/app/:appName/unit/:unitId"
              element={<Breadcrumb />}
            />
          </Routes>
        </MemoryRouter>
      </Provider>
    );
    expect(screen.getByTestId("breadcrumb-items")).toHaveTextContent(
      "group-testApplicationslogstashlogstash-0"
    );
    expect(screen.getByTestId("breadcrumb-model")).toHaveTextContent(
      "group-test"
    );
    expect(screen.getByTestId("breadcrumb-section")).toHaveTextContent(
      "Applications"
    );
    expect(screen.getByTestId("breadcrumb-units")).toHaveTextContent(
      "logstash-0"
    );
  });

  it("displays correctly on machine details", () => {
    const store = mockStore(rootStateFactory.build());
    render(
      <Provider store={store}>
        <MemoryRouter
          initialEntries={["/models/eggman@external/group-test/machine/0"]}
        >
          <Routes>
            <Route
              path="/models/:userName/:modelName/machine/:machineId"
              element={<Breadcrumb />}
            />
          </Routes>
        </MemoryRouter>
      </Provider>
    );
    expect(screen.getByTestId("breadcrumb-items")).toHaveTextContent(
      "group-testMachines0"
    );
    expect(screen.getByTestId("breadcrumb-model")).toHaveTextContent(
      "group-test"
    );
    expect(screen.getByTestId("breadcrumb-section")).toHaveTextContent(
      "Machines"
    );
    expect(screen.getByTestId("breadcrumb-machines")).toHaveTextContent("0");
  });
});
