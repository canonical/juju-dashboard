import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { vi } from "vitest";

import * as actionsHooks from "juju/api-hooks/actions";
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

import CharmActionsPanel from "./CharmActionsPanel";
import { ConfirmationDialogLabel } from "./ConfirmationDialog";

vi.mock("juju/api-hooks/actions", () => {
  return {
    useExecuteActionOnUnits: vi.fn().mockReturnValue(vi.fn()),
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
    vi.resetModules();
    vi.restoreAllMocks();
  });

  it("Renders the list of available actions", async () => {
    renderComponent(
      <CharmActionsPanel
        charmURL={charmURL}
        onRemovePanelQueryParams={vi.fn()}
      />,
      { path, url, state },
    );
    expect(await screen.findAllByRole("radio")).toHaveLength(2);
  });

  it("validates that an action is selected before submitting", async () => {
    renderComponent(
      <CharmActionsPanel
        charmURL={charmURL}
        onRemovePanelQueryParams={vi.fn()}
      />,
      { path, url, state },
    );
    expect(
      await screen.findByRole("button", { name: "Run action" }),
    ).toHaveAttribute("aria-disabled");
  });

  it("disables the submit button if no units are selected", async () => {
    state.juju.selectedApplications = [
      charmApplicationFactory.build({
        "charm-url": "ch:ceph",
        "unit-count": 0,
      }),
    ];
    renderComponent(
      <CharmActionsPanel
        charmURL={charmURL}
        onRemovePanelQueryParams={vi.fn()}
      />,
      { path, url, state },
    );
    expect(
      await screen.findByRole("button", { name: "Run action" }),
    ).toHaveAttribute("aria-disabled");
    await userEvent.click(await screen.findByRole("radio", { name: "pause" }));
    expect(
      await screen.findByRole("button", { name: "Run action" }),
    ).toHaveAttribute("aria-disabled");
    await userEvent.click(
      await screen.findByRole("button", { name: "Run action" }),
    );
    expect(
      document.querySelector(".p-confirmation-modal"),
    ).not.toBeInTheDocument();
  });

  it("disables the submit button if a required text field is empty", async () => {
    renderComponent(
      <CharmActionsPanel
        charmURL={charmURL}
        onRemovePanelQueryParams={vi.fn()}
      />,
      { path, url, state },
    );
    expect(
      await screen.findByRole("button", { name: "Run action" }),
    ).toHaveAttribute("aria-disabled");
    await userEvent.click(
      await screen.findByRole("radio", { name: "add-disk" }),
    );
    await userEvent.type(
      await screen.findByRole("textbox", { name: "osd-devices" }),
      "some content",
    );
    await waitFor(async () =>
      expect(
        await screen.findByRole("button", { name: "Run action" }),
      ).not.toBeDisabled(),
    );
  });

  it("shows a confirmation dialog on clicking submit", async () => {
    const executeActionOnUnitsSpy = vi
      .fn()
      .mockImplementation(vi.fn().mockResolvedValue(null));
    vi.spyOn(actionsHooks, "useExecuteActionOnUnits").mockImplementation(
      () => executeActionOnUnitsSpy,
    );
    renderComponent(
      <CharmActionsPanel
        charmURL={charmURL}
        onRemovePanelQueryParams={vi.fn()}
      />,
      { path, url, state },
    );
    expect(
      await screen.findByRole("button", { name: "Run action" }),
    ).toHaveAttribute("aria-disabled");
    await userEvent.click(await screen.findByRole("radio", { name: "pause" }));
    expect(
      await screen.findByRole("button", { name: "Run action" }),
    ).not.toHaveAttribute("aria-disabled");
    await userEvent.click(
      await screen.findByRole("button", { name: "Run action" }),
    );
    expect(document.querySelector(".p-modal")).toBeInTheDocument();
    expect(
      await screen.findByTestId("confirmation-modal-unit-count"),
    ).toHaveTextContent("1 (2)");
    expect(executeActionOnUnitsSpy).not.toHaveBeenCalled();
  });

  it("submits the action request to the api without options", async () => {
    const executeActionOnUnitsSpy = vi
      .fn()
      .mockImplementation(vi.fn().mockResolvedValue(null));
    vi.spyOn(actionsHooks, "useExecuteActionOnUnits").mockImplementation(
      () => executeActionOnUnitsSpy,
    );
    renderComponent(
      <CharmActionsPanel
        charmURL={charmURL}
        onRemovePanelQueryParams={vi.fn()}
      />,
      { path, url, state },
    );
    expect(
      await screen.findByRole("button", { name: "Run action" }),
    ).toHaveAttribute("aria-disabled");
    await userEvent.click(await screen.findByRole("radio", { name: "pause" }));
    expect(
      await screen.findByRole("button", { name: "Run action" }),
    ).not.toHaveAttribute("aria-disabled");
    await userEvent.click(
      await screen.findByRole("button", { name: "Run action" }),
    );
    await userEvent.click(
      await screen.findByRole("button", {
        name: ConfirmationDialogLabel.CONFIRM_BUTTON,
      }),
    );
    const [call] = executeActionOnUnitsSpy.mock.calls;
    expect(call[0]).toEqual(["ceph-0", "ceph-1"]);
    expect(call[1]).toBe("pause");
    expect(call[2]).toEqual({}); // no options
    expect(
      await screen.findByText(ConfirmationDialogLabel.ACTION_SUCCESS),
    ).toBeInTheDocument();
  });

  it("should pass the selected action form values to the API call", async () => {
    const executeActionOnUnitsSpy = vi
      .fn()
      .mockImplementation(vi.fn().mockResolvedValue(null));
    vi.spyOn(actionsHooks, "useExecuteActionOnUnits").mockImplementation(
      () => executeActionOnUnitsSpy,
    );
    renderComponent(
      <CharmActionsPanel
        charmURL={charmURL}
        onRemovePanelQueryParams={vi.fn()}
      />,
      { path, url, state },
    );
    await userEvent.click(
      await screen.findByRole("radio", { name: "add-disk" }),
    );
    await userEvent.type(
      await screen.findByRole("textbox", { name: "osd-devices" }),
      "new device",
    );
    expect(
      await screen.findByRole("button", { name: "Run action" }),
    ).not.toHaveAttribute("aria-disabled");
    await userEvent.click(
      await screen.findByRole("button", { name: "Run action" }),
    );
    await userEvent.click(
      await screen.findByRole("button", {
        name: ConfirmationDialogLabel.CONFIRM_BUTTON,
      }),
    );
    const [call] = executeActionOnUnitsSpy.mock.calls;
    expect(call[0]).toEqual(["ceph-0", "ceph-1"]);
    expect(call[1]).toBe("add-disk");
    expect(call[2]).toEqual({
      bucket: "",
      "osd-devices": "new device",
    });
  });

  it("should cancel the run selected action confirmation modal", async () => {
    renderComponent(
      <CharmActionsPanel
        charmURL={charmURL}
        onRemovePanelQueryParams={vi.fn()}
      />,
      { path, url, state },
    );
    expect(
      await screen.findByRole("button", { name: "Run action" }),
    ).toHaveAttribute("aria-disabled");
    await userEvent.click(await screen.findByRole("radio", { name: "pause" }));
    expect(
      await screen.findByRole("button", { name: "Run action" }),
    ).not.toHaveAttribute("aria-disabled");
    await userEvent.click(
      await screen.findByRole("button", { name: "Run action" }),
    );
    expect(
      screen.queryByRole("dialog", { name: "Run pause?" }),
    ).toBeInTheDocument();
    await userEvent.click(
      await screen.findByRole("button", {
        name: ConfirmationDialogLabel.CANCEL_BUTTON,
      }),
    );
    expect(
      screen.queryByRole("dialog", { name: "Run pause?" }),
    ).not.toBeInTheDocument();
  });

  it("should throw error when executing action on unit", async () => {
    const executeActionOnUnitsSpy = vi.fn().mockImplementation(
      vi.fn().mockResolvedValue({
        actions: [{ error: "Error when executing action on unit!" }],
      }),
    );
    vi.spyOn(actionsHooks, "useExecuteActionOnUnits").mockImplementation(
      () => executeActionOnUnitsSpy,
    );
    renderComponent(
      <CharmActionsPanel
        charmURL={charmURL}
        onRemovePanelQueryParams={vi.fn()}
      />,
      { path, url, state },
    );
    expect(
      await screen.findByRole("button", { name: "Run action" }),
    ).toHaveAttribute("aria-disabled");
    await userEvent.click(await screen.findByRole("radio", { name: "pause" }));
    expect(
      await screen.findByRole("button", { name: "Run action" }),
    ).not.toHaveAttribute("aria-disabled");
    await userEvent.click(
      await screen.findByRole("button", { name: "Run action" }),
    );
    await userEvent.click(
      screen.getByRole("button", {
        name: ConfirmationDialogLabel.CONFIRM_BUTTON,
      }),
    );
    expect(executeActionOnUnitsSpy).toHaveBeenCalledTimes(1);
    expect(
      screen.getByText(ConfirmationDialogLabel.ACTION_ERROR),
    ).toBeInTheDocument();
  });
});
