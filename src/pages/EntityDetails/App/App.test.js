import { mount } from "enzyme";
import configureStore from "redux-mock-store";
import { Provider } from "react-redux";
import { MemoryRouter, Route } from "react-router";
import { QueryParamProvider } from "use-query-params";

import TestRoute from "components/Routes/TestRoute";

import { waitForComponentToPaint } from "testing/utils";
import dataDump from "testing/complete-redux-store-dump";

import App from "./App";

const mockStore = configureStore([]);

jest.mock("components/Topology/Topology", () => {
  const Topology = () => <div className="topology"></div>;
  return Topology;
});

describe("Entity Details App", () => {
  async function generateComponent() {
    const store = mockStore(dataDump);
    const wrapper = mount(
      <Provider store={store}>
        <MemoryRouter
          initialEntries={[
            "/models/user-island@external/canonical-kubernetes/app/etcd",
          ]}
        >
          <TestRoute path="/models/:userName/:modelName?/app/:appName?">
            <QueryParamProvider ReactRouterRoute={Route}>
              <App />
            </QueryParamProvider>
          </TestRoute>
        </MemoryRouter>
      </Provider>
    );
    await waitForComponentToPaint(wrapper);
    return wrapper;
  }

  it("renders the info panel", async () => {
    const wrapper = await generateComponent();
    expect(wrapper.find("InfoPanel").exists()).toBe(true);
  });

  it("allows you to switch between a unit and machines view", async () => {
    const wrapper = await generateComponent();
    expect(wrapper.find("table.entity-details__units").length).toBe(1);
    expect(wrapper.find("table.entity-details__machines").length).toBe(0);
    wrapper.find('button[value="machines"]').simulate("click", {});
    expect(wrapper.find("table.entity-details__units").length).toBe(0);
    expect(wrapper.find("table.entity-details__machines").length).toBe(1);
  });

  it("supports selecting all units", async () => {
    const wrapper = await generateComponent();

    const findSelectAll = () => wrapper.find('input[name="selectAll"]');
    const findSelectedUnits = () => wrapper.find('input[name="selectedUnits"]');
    const simulateSelectAllChange = async (value) => {
      findSelectAll().simulate("change", {
        target: { name: "selectAll", value },
      });
      await waitForComponentToPaint(wrapper);
    };
    const unitsListChecked = (value) => {
      findSelectedUnits().forEach((input) => {
        expect(input.prop("checked")).toBe(value);
      });
    };
    const selectAllChecked = (value) => {
      expect(findSelectAll().prop("checked")).toBe(value);
    };

    // All units get selected when clicking selectAll
    selectAllChecked(false);
    unitsListChecked(false);
    await simulateSelectAllChange(true);
    unitsListChecked(true);
    selectAllChecked(true);

    // All units get de-selected when clicking selectAll
    await simulateSelectAllChange(false);
    unitsListChecked(false);

    // Selecting all units selects the selectAll checkbox
    findSelectedUnits().forEach(async (input) => {
      input.simulate("change", {
        target: { name: "selectedUnits", value: input.prop("value") },
      });
      await waitForComponentToPaint(wrapper);
    });
    selectAllChecked(true);

    // De-selecting one unit de-selects the selectAll checkbox
    const firstInput = findSelectedUnits().at(0);
    firstInput.simulate("change", {
      target: { name: "selectedUnits", value: firstInput.prop("value") },
    });
    await waitForComponentToPaint(wrapper);
    selectAllChecked(false);

    // Clickcing selectAll with partial units selected, selects all
    await simulateSelectAllChange(true);
    unitsListChecked(true);
    selectAllChecked(true);

    // De-selecting the selectAll deselects all the units.
    await simulateSelectAllChange(false);
    unitsListChecked(false);
  });
});
