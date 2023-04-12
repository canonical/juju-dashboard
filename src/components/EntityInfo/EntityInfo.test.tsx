import { render, screen } from "@testing-library/react";
import { Provider } from "react-redux";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import configureStore from "redux-mock-store";

import { rootStateFactory } from "testing/factories/root";

import EntityInfo from "./EntityInfo";

const mockStore = configureStore([]);

jest.mock("components/Topology/Topology", () => {
  const Topology = () => <div className="topology"></div>;
  return Topology;
});

describe("Entity info", () => {
  it("renders the expanded topology on click", () => {
    const store = mockStore(rootStateFactory.build());
    render(
      <Provider store={store}>
        <MemoryRouter
          initialEntries={["/models/user-eggman@external/group-test"]}
        >
          <Routes>
            <Route
              path="/models/:userName/:modelName"
              element={
                <EntityInfo
                  data={{
                    name: "model1",
                    controller: "controller1",
                    region: "eu1",
                  }}
                />
              }
            />
          </Routes>
        </MemoryRouter>
      </Provider>
    );
    expect(screen.getByText("eu1")).toHaveAttribute("data-name", "region");
  });
});
