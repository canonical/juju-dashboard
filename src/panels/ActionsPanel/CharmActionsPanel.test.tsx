import type { InitialEntry } from "@remix-run/router";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Provider } from "react-redux";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import configureStore from "redux-mock-store";

import * as juju from "juju/api";
import { executeActionOnUnits } from "juju/api";
import type { RootState } from "store/store";
import { rootStateFactory } from "testing/factories";
import {
  applicationCharmActionFactory,
  applicationCharmActionParamsFactory,
} from "testing/factories/juju/ActionV7";
import { charmApplicationFactory } from "testing/factories/juju/Charms";
import { charmInfoFactory } from "testing/factories/juju/Charms";
import {
  jujuStateFactory,
  modelDataFactory,
  modelDataInfoFactory,
} from "testing/factories/juju/juju";

import CharmActionsPanel, { Label } from "./CharmActionsPanel";

const mockStore = configureStore([]);

jest.mock("juju/api", () => {
  return {
    executeActionOnUnits: jest.fn(),
  };
});

describe("CharmActionsPanel", () => {
  let state: RootState;

  function generateComponent(initialEntries?: InitialEntry[]) {
    if (!initialEntries) {
      initialEntries = [
        "/models/user-eggman@external/group-test/app/kubernetes-master?panel=execute-action&charm=ch:ceph",
      ];
    }
    const store = mockStore(state);
    render(
      <Provider store={store}>
        <MemoryRouter initialEntries={initialEntries}>
          <Routes>
            <Route
              path="/models/:userName/:modelName/app/:appName"
              element={<CharmActionsPanel />}
            />
          </Routes>
        </MemoryRouter>
      </Provider>
    );
  }

  beforeEach(() => {
    state = rootStateFactory.build({
      juju: jujuStateFactory.build({
        charms: [
          charmInfoFactory.build({
            url: "ch:ceph",
            actions: {
              specs: {
                "add-disk": applicationCharmActionFactory.build({
                  params: applicationCharmActionParamsFactory.build({
                    properties: {
                      bucket: {
                        type: "string",
                      },
                      "osd-devices": {
                        type: "string",
                      },
                    },
                    required: ["osd-devices"],
                    title: "add-disk",
                    type: "object",
                  }),
                }),
                pause: applicationCharmActionFactory.build({
                  params: applicationCharmActionParamsFactory.build({
                    title: "pause",
                    type: "object",
                  }),
                }),
              },
            },
          }),
        ],
        modelData: {
          abc123: modelDataFactory.build({
            info: modelDataInfoFactory.build({
              name: "group-test",
            }),
          }),
        },
        selectedApplications: [
          charmApplicationFactory.build({
            name: "ceph",
            "charm-url": "ch:ceph",
          }),
        ],
      }),
    });
  });

  afterEach(() => {
    jest.resetModules();
  });

  it("displays a message if viewing the panel without selecting a charm", async () => {
    generateComponent([
      "/models/user-eggman@external/group-test/app/kubernetes-master?panel=execute-action&charm=something-else",
    ]);
    expect(screen.getByText(Label.NONE_SELECTED)).toBeInTheDocument();
  });

  it("Renders the list of available actions", async () => {
    generateComponent();
    expect(await screen.findAllByRole("radio")).toHaveLength(2);
  });

  it("validates that an action is selected before submitting", async () => {
    generateComponent();
    expect(
      await screen.findByRole("button", { name: "Run action" })
    ).toBeDisabled();
  });

  it("displays the number of selected apps and units", async () => {
    generateComponent();
    expect(await screen.findByRole("heading")).toHaveTextContent(
      "1 application (2 units) selected"
    );
  });

  it("successfully handles no units selected", async () => {
    state.juju.selectedApplications = [
      charmApplicationFactory.build({
        "charm-url": "ch:ceph",
        "unit-count": 0,
      }),
    ];
    generateComponent();
    expect(await screen.findByRole("heading")).toHaveTextContent(
      "1 application (0 units) selected"
    );
  });

  it("disables the submit button if no units are selected", async () => {
    state.juju.selectedApplications = [
      charmApplicationFactory.build({
        "charm-url": "ch:ceph",
        "unit-count": 0,
      }),
    ];
    generateComponent();
    expect(
      await screen.findByRole("button", { name: "Run action" })
    ).toBeDisabled();
    await userEvent.click(await screen.findByRole("radio", { name: "pause" }));
    expect(
      await screen.findByRole("button", { name: "Run action" })
    ).toBeDisabled();
    await userEvent.click(
      await screen.findByRole("button", { name: "Run action" })
    );
    expect(
      document.querySelector(".p-confirmation-modal")
    ).not.toBeInTheDocument();
  });

  it("disables the submit button if a required text field is empty", async () => {
    generateComponent();
    expect(
      await screen.findByRole("button", { name: "Run action" })
    ).toBeDisabled();
    await userEvent.click(
      await screen.findByRole("radio", { name: "add-disk" })
    );
    await userEvent.type(
      await screen.findByRole("textbox", { name: "osd-devices" }),
      "some content"
    );
    await waitFor(async () =>
      expect(
        await screen.findByRole("button", { name: "Run action" })
      ).not.toBeDisabled()
    );
  });

  it("disables the submit button if a required boolean field is not ticked", async () => {
    state.juju.charms = [
      charmInfoFactory.build({
        url: "ch:ceph",
        actions: {
          specs: {
            "add-disk": applicationCharmActionFactory.build({
              params: applicationCharmActionParamsFactory.build({
                properties: {
                  bucket: {
                    type: "string",
                  },
                  "osd-devices": {
                    type: "boolean",
                  },
                },
                required: ["osd-devices"],
                title: "add-disk",
                type: "object",
              }),
            }),
          },
        },
      }),
    ];
    generateComponent();
    await userEvent.click(
      await screen.findByRole("radio", { name: "add-disk" })
    );
    expect(
      await screen.findByRole("button", { name: "Run action" })
    ).toBeDisabled();
    await userEvent.click(
      await screen.findByRole("checkbox", { name: "osd-devices" })
    );
    await waitFor(async () =>
      expect(
        await screen.findByRole("button", { name: "Run action" })
      ).not.toBeDisabled()
    );
  });

  it("shows a confirmation dialog on clicking submit", async () => {
    generateComponent();
    expect(
      await screen.findByRole("button", { name: "Run action" })
    ).toBeDisabled();
    await userEvent.click(await screen.findByRole("radio", { name: "pause" }));
    expect(
      await screen.findByRole("button", { name: "Run action" })
    ).not.toBeDisabled();
    await userEvent.click(
      await screen.findByRole("button", { name: "Run action" })
    );
    expect(document.querySelector(".p-confirmation-modal")).toBeInTheDocument();
    expect(
      await screen.findByTestId("confirmation-modal-unit-count")
    ).toHaveTextContent("1 (2)");
    expect(executeActionOnUnits).not.toHaveBeenCalled();
  });

  it("submits the action request to the api without options", async () => {
    const executeActionOnUnitsSpy = jest
      .spyOn(juju, "executeActionOnUnits")
      .mockImplementation(() => Promise.resolve(undefined));
    generateComponent();
    expect(
      await screen.findByRole("button", { name: "Run action" })
    ).toBeDisabled();
    await userEvent.click(await screen.findByRole("radio", { name: "pause" }));
    expect(
      await screen.findByRole("button", { name: "Run action" })
    ).not.toBeDisabled();
    await userEvent.click(
      await screen.findByRole("button", { name: "Run action" })
    );
    await userEvent.click(
      await screen.findByRole("button", { name: "Confirm" })
    );
    const call = executeActionOnUnitsSpy.mock.calls[0];
    expect(call[0]).toEqual(["ceph-0", "ceph-1"]);
    expect(call[1]).toBe("pause");
    expect(call[2]).toEqual({}); // no options
    executeActionOnUnitsSpy.mockRestore();
  });

  it("submits the action request to the api with options that are required", async () => {
    const executeActionOnUnitsSpy = jest
      .spyOn(juju, "executeActionOnUnits")
      .mockImplementation(() => Promise.resolve(undefined));
    generateComponent();
    await userEvent.click(
      await screen.findByRole("radio", { name: "add-disk" })
    );
    await userEvent.type(
      await screen.findByRole("textbox", { name: "osd-devices" }),
      "new device"
    );
    expect(
      await screen.findByRole("button", { name: "Run action" })
    ).not.toBeDisabled();
    await userEvent.click(
      await screen.findByRole("button", { name: "Run action" })
    );
    await userEvent.click(
      await screen.findByRole("button", { name: "Confirm" })
    );
    const call = executeActionOnUnitsSpy.mock.calls[0];
    expect(call[0]).toEqual(["ceph-0", "ceph-1"]);
    expect(call[1]).toBe("add-disk");
    expect(call[2]).toEqual({
      bucket: "",
      "osd-devices": "new device",
    });
    executeActionOnUnitsSpy.mockRestore();
  });
});
