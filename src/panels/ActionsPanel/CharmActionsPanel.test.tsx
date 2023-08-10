import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Toaster } from "react-hot-toast";

import * as juju from "juju/api";
import { executeActionOnUnits } from "juju/api";
import type { RootState } from "store/store";
import { rootStateFactory } from "testing/factories";
import { applicationCharmActionParamsFactory } from "testing/factories/juju/ActionV7";
import {
  charmApplicationFactory,
  charmInfoFactory,
  charmActionSpecFactory,
} from "testing/factories/juju/Charms";
import {
  jujuStateFactory,
  modelDataFactory,
  modelDataInfoFactory,
} from "testing/factories/juju/juju";
import { renderComponent } from "testing/utils";

import CharmActionsPanel, { Label } from "./CharmActionsPanel";

jest.mock("juju/api", () => {
  return {
    executeActionOnUnits: jest.fn(),
  };
});

describe("CharmActionsPanel", () => {
  let state: RootState;
  const path = "/models/:userName/:modelName/app/:appName";
  const url =
    "/models/user-eggman@external/group-test/app/kubernetes-master?panel=select-charms-and-actions";
  const charmURL = "ch:ceph";

  beforeEach(() => {
    state = rootStateFactory.build({
      juju: jujuStateFactory.build({
        charms: [
          charmInfoFactory.build({
            url: "ch:ceph",
            actions: {
              specs: {
                "add-disk": charmActionSpecFactory.build({
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
                pause: charmActionSpecFactory.build({
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

  it("Renders the list of available actions", async () => {
    renderComponent(
      <>
        <CharmActionsPanel
          charmURL={charmURL}
          onRemovePanelQueryParams={jest.fn()}
        />
        <Toaster />
      </>,
      { path, url, state }
    );
    expect(await screen.findAllByRole("radio")).toHaveLength(2);
  });

  it("validates that an action is selected before submitting", async () => {
    renderComponent(
      <>
        <CharmActionsPanel
          charmURL={charmURL}
          onRemovePanelQueryParams={jest.fn()}
        />
        <Toaster />
      </>,
      { path, url, state }
    );
    expect(
      await screen.findByRole("button", { name: "Run action" })
    ).toBeDisabled();
  });

  it("disables the submit button if no units are selected", async () => {
    state.juju.selectedApplications = [
      charmApplicationFactory.build({
        "charm-url": "ch:ceph",
        "unit-count": 0,
      }),
    ];
    renderComponent(
      <>
        <CharmActionsPanel
          charmURL={charmURL}
          onRemovePanelQueryParams={jest.fn()}
        />
        <Toaster />
      </>,
      { path, url, state }
    );
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
    renderComponent(
      <>
        <CharmActionsPanel
          charmURL={charmURL}
          onRemovePanelQueryParams={jest.fn()}
        />
        <Toaster />
      </>,
      { path, url, state }
    );
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
            "add-disk": charmActionSpecFactory.build({
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
    renderComponent(
      <>
        <CharmActionsPanel
          charmURL={charmURL}
          onRemovePanelQueryParams={jest.fn()}
        />
        <Toaster />
      </>,
      { path, url, state }
    );
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
    renderComponent(
      <>
        <CharmActionsPanel
          charmURL={charmURL}
          onRemovePanelQueryParams={jest.fn()}
        />
        <Toaster />
      </>,
      { path, url, state }
    );
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
    renderComponent(
      <>
        <CharmActionsPanel
          charmURL={charmURL}
          onRemovePanelQueryParams={jest.fn()}
        />
        <Toaster />
      </>,
      { path, url, state }
    );
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
    expect(await screen.findByText(Label.ACTION_SUCCESS)).toBeInTheDocument();
  });

  it("submits the action request to the api with options that are required", async () => {
    const executeActionOnUnitsSpy = jest
      .spyOn(juju, "executeActionOnUnits")
      .mockImplementation(() => Promise.resolve(undefined));
    renderComponent(
      <>
        <CharmActionsPanel
          charmURL={charmURL}
          onRemovePanelQueryParams={jest.fn()}
        />
        <Toaster />
      </>,
      { path, url, state }
    );
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

  it("handles API errors", async () => {
    const executeActionOnUnitsSpy = jest
      .spyOn(juju, "executeActionOnUnits")
      .mockImplementation(() => Promise.reject());
    renderComponent(
      <>
        <CharmActionsPanel
          charmURL={charmURL}
          onRemovePanelQueryParams={jest.fn()}
        />
        <Toaster />
      </>,
      { path, url, state }
    );
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
    expect(await screen.findByText(Label.ACTION_ERROR)).toBeInTheDocument();
  });
});
