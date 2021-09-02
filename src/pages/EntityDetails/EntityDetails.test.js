import { render } from "@testing-library/react";
import configureStore from "redux-mock-store";
import { Provider } from "react-redux";
import { QueryParamProvider } from "use-query-params";
import { MemoryRouter, Route } from "react-router";

import { reduxStateFactory } from "testing/redux-factory";

import TestRoute from "components/Routes/TestRoute";

import EntityDetails from "./EntityDetails";

jest.mock("components/Topology/Topology", () => {
  const Topology = () => <div className="topology"></div>;
  return Topology;
});

const mockStore = configureStore([]);

describe("Entity Details Container", () => {
  it("should display the correct window title", () => {
    const mockState = reduxStateFactory().build(
      {},
      {
        transient: {
          models: [{ name: "mymodel", owner: "spock@external" }],
        },
      }
    );
    const store = mockStore(mockState);

    render(
      <Provider store={store}>
        <MemoryRouter initialEntries={["/models/spock@external/mymodel"]}>
          <QueryParamProvider ReactRouterRoute={Route}>
            <TestRoute path="/models/:userName/:modelName?">
              <EntityDetails />
            </TestRoute>
          </QueryParamProvider>
        </MemoryRouter>
      </Provider>
    );

    expect(document.title).toEqual("Model: mymodel | Juju Dashboard");
  });
});
