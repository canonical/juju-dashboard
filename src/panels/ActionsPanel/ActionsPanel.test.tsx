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
  applicationCharmActionsResultFactory,
  applicationsCharmActionsResultsFactory,
  applicationCharmActionFactory,
  applicationCharmActionParamsFactory,
} from "testing/factories/juju/ActionV7";
import {
  jujuStateFactory,
  modelDataFactory,
  modelDataInfoFactory,
} from "testing/factories/juju/juju";

import ActionsPanel from "./ActionsPanel";

const mockStore = configureStore([]);

const mockResponse = applicationsCharmActionsResultsFactory.build({
  results: [
    applicationCharmActionsResultFactory.build({
      "application-tag": "application-ceph",
      actions: {
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
    }),
  ],
});

jest.mock("juju/api", () => {
  return {
    executeActionOnUnits: jest.fn(),
    getActionsForApplication: jest.fn(),
  };
});

describe("ActionsPanel", () => {
  let state: RootState;

  function generateComponent(initialEntries?: InitialEntry[]) {
    if (!initialEntries) {
      initialEntries = [
        "/models/user-eggman@external/group-test/app/kubernetes-master?panel=execute-action&units=ceph%2F0,ceph%2F1",
      ];
    }
    const store = mockStore(state);
    render(
      <Provider store={store}>
        <MemoryRouter initialEntries={initialEntries}>
          <Routes>
            <Route
              path="/models/:userName/:modelName/app/:appName"
              element={<ActionsPanel />}
            />
          </Routes>
        </MemoryRouter>
      </Provider>
    );
  }

  beforeEach(() => {
    const getActionsForApplicationSpy = jest.spyOn(
      juju,
      "getActionsForApplication"
    );
    getActionsForApplicationSpy.mockResolvedValue(mockResponse);
    state = rootStateFactory.build({
      juju: jujuStateFactory.build({
        modelData: {
          abc123: modelDataFactory.build({
            info: modelDataInfoFactory.build({
              name: "group-test",
            }),
          }),
        },
      }),
    });
  });

  afterEach(() => {
    jest.resetModules();
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

  it("updates the title & unit list based on the number of units selected", async () => {
    generateComponent();
    expect(await screen.findByText("2 units selected")).toBeInTheDocument();
    expect(
      await screen.findByTestId("actions-panel-unit-list")
    ).toHaveTextContent("Run action on: ceph/0, 1");
  });

  it("successfully handles no units selected", async () => {
    generateComponent([
      "/models/user-eggman@external/group-test/app/kubernetes-master?panel=execute-action",
    ]);
    expect(await screen.findByRole("heading")).toHaveTextContent(
      "0 units selected"
    );
    expect(
      await screen.findByTestId("actions-panel-unit-list")
    ).toHaveTextContent("Run action on: 0 units selected");
  });

  it("disables the submit button if no units are selected", async () => {
    generateComponent([
      "/models/user-eggman@external/group-test/app/kubernetes-master?panel=execute-action",
    ]);
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
    const mockResponse = applicationsCharmActionsResultsFactory.build({
      results: [
        applicationCharmActionsResultFactory.build({
          "application-tag": "application-ceph",
          actions: {
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
        }),
      ],
    });
    const getActionsForApplicationSpy = jest.spyOn(
      juju,
      "getActionsForApplication"
    );
    getActionsForApplicationSpy.mockResolvedValue(mockResponse);
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
    ).toHaveTextContent("2");
    expect(
      await screen.findByTestId("confirmation-modal-unit-names")
    ).toHaveTextContent("ceph/0, 1");
    expect(executeActionOnUnits).not.toHaveBeenCalled();
  });

  it("submits the action request to the api without options", async () => {
    const executeActionOnUnitsSpy = jest.spyOn(juju, "executeActionOnUnits");
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
    expect(call[0]).toEqual(["ceph/0", "ceph/1"]);
    expect(call[1]).toBe("pause");
    expect(call[2]).toEqual({}); // no options
    executeActionOnUnitsSpy.mockRestore();
  });

  it("submits the action request to the api with options that are required", async () => {
    const executeActionOnUnitsSpy = jest.spyOn(juju, "executeActionOnUnits");
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
    expect(call[0]).toEqual(["ceph/0", "ceph/1"]);
    expect(call[1]).toBe("add-disk");
    expect(call[2]).toEqual({
      bucket: "",
      "osd-devices": "new device",
    });
    executeActionOnUnitsSpy.mockRestore();
  });
});
