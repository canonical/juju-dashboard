import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { vi } from "vitest";

import * as actionsHooks from "juju/api-hooks/actions";
import type { RootState } from "store/store";
import { rootStateFactory } from "testing/factories";
import {
  applicationCharmActionParamsFactory,
  applicationCharmActionsResultFactory,
  applicationsCharmActionsResultsFactory,
} from "testing/factories/juju/ActionV7";
import { charmActionSpecFactory } from "testing/factories/juju/Charms";
import {
  jujuStateFactory,
  modelDataFactory,
  modelDataInfoFactory,
} from "testing/factories/juju/juju";
import { renderComponent } from "testing/utils";

import ActionsPanel from "./ActionsPanel";
import { ConfirmationDialogLabel } from "./ConfirmationDialog";
import { Label as ActionsPanelLabel } from "./types";

const mockResponse = applicationsCharmActionsResultsFactory.build({
  results: [
    applicationCharmActionsResultFactory.build({
      "application-tag": "application-ceph",
      actions: {
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
        "get-quota": charmActionSpecFactory.build({
          params: applicationCharmActionParamsFactory.build({
            properties: {
              directory: {
                type: "string",
              },
              "max-bytes": {
                type: "integer",
              },
              "max-files": {
                type: "integer",
              },
            },
            required: ["directory"],
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
    }),
  ],
});

vi.mock("juju/api-hooks/actions", () => {
  return {
    useExecuteActionOnUnits: vi.fn().mockReturnValue(vi.fn()),
    useGetActionsForApplication: vi.fn().mockReturnValue(vi.fn()),
  };
});

describe("ActionsPanel", () => {
  let state: RootState;
  const path = "/models/:userName/:modelName/app/:appName";
  const url =
    "/models/user-eggman@external/group-test/app/kubernetes-master?panel=execute-action&units=ceph%2F0,ceph%2F1";

  beforeEach(() => {
    const getActionsForApplicationSpy = vi
      .fn()
      .mockImplementation(vi.fn().mockResolvedValue(mockResponse));
    vi.spyOn(actionsHooks, "useGetActionsForApplication").mockImplementation(
      () => getActionsForApplicationSpy,
    );
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
    vi.resetModules();
    vi.restoreAllMocks();
  });

  it("Renders the list of available actions", async () => {
    renderComponent(<ActionsPanel />, { path, url, state });
    expect(await screen.findAllByRole("radio")).toHaveLength(3);
  });

  it("validates that an action is selected before submitting", async () => {
    renderComponent(<ActionsPanel />, { path, url, state });
    expect(
      await screen.findByRole("button", { name: "Run action" }),
    ).toBeDisabled();
  });

  it("updates the title & unit list based on the number of units selected", async () => {
    renderComponent(<ActionsPanel />, { path, url, state });
    expect(await screen.findByText("2 units selected")).toBeInTheDocument();
    expect(
      await screen.findByTestId("actions-panel-unit-list"),
    ).toHaveTextContent("Run action on: ceph/0, 1");
  });

  it("successfully handles no units selected", async () => {
    renderComponent(<ActionsPanel />, {
      path,
      url: "/models/user-eggman@external/group-test/app/kubernetes-master?panel=execute-action",
      state,
    });
    expect(await screen.findByRole("heading")).toHaveTextContent(
      ActionsPanelLabel.NO_UNITS_SELECTED,
    );
    expect(
      await screen.findByTestId("actions-panel-unit-list"),
    ).toHaveTextContent(
      `Run action on: ${ActionsPanelLabel.NO_UNITS_SELECTED}`,
    );
  });

  it("disables the submit button if no units are selected", async () => {
    renderComponent(<ActionsPanel />, {
      path,
      url: "/models/user-eggman@external/group-test/app/kubernetes-master?panel=execute-action",
      state,
    });
    expect(
      await screen.findByRole("button", { name: "Run action" }),
    ).toBeDisabled();
    await userEvent.click(await screen.findByRole("radio", { name: "pause" }));
    expect(
      await screen.findByRole("button", { name: "Run action" }),
    ).toBeDisabled();
    await userEvent.click(
      await screen.findByRole("button", { name: "Run action" }),
    );
    expect(
      document.querySelector(".p-confirmation-modal"),
    ).not.toBeInTheDocument();
  });

  it("disables the submit button if a required text field is empty", async () => {
    renderComponent(<ActionsPanel />, { path, url, state });
    expect(
      await screen.findByRole("button", { name: "Run action" }),
    ).toBeDisabled();
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
    renderComponent(<ActionsPanel />, { path, url, state });
    expect(
      await screen.findByRole("button", { name: "Run action" }),
    ).toBeDisabled();
    await userEvent.click(await screen.findByRole("radio", { name: "pause" }));
    expect(
      await screen.findByRole("button", { name: "Run action" }),
    ).not.toBeDisabled();
    await userEvent.click(
      await screen.findByRole("button", { name: "Run action" }),
    );
    expect(document.querySelector(".p-modal")).toBeInTheDocument();
    expect(
      await screen.findByTestId("confirmation-modal-unit-count"),
    ).toHaveTextContent("2");
    expect(
      await screen.findByTestId("confirmation-modal-unit-names"),
    ).toHaveTextContent("ceph/0, 1");
    expect(executeActionOnUnitsSpy).not.toHaveBeenCalled();
  });

  it("submits the action request to the api without options", async () => {
    const executeActionOnUnitsSpy = vi
      .fn()
      .mockImplementation(vi.fn().mockResolvedValue(null));
    vi.spyOn(actionsHooks, "useExecuteActionOnUnits").mockImplementation(
      () => executeActionOnUnitsSpy,
    );
    renderComponent(<ActionsPanel />, { path, url, state });
    expect(
      await screen.findByRole("button", { name: "Run action" }),
    ).toBeDisabled();
    await userEvent.click(await screen.findByRole("radio", { name: "pause" }));
    expect(
      await screen.findByRole("button", { name: "Run action" }),
    ).not.toBeDisabled();
    await userEvent.click(
      await screen.findByRole("button", { name: "Run action" }),
    );
    await userEvent.click(
      await screen.findByRole("button", {
        name: ConfirmationDialogLabel.CONFIRM_BUTTON,
      }),
    );
    const [call] = executeActionOnUnitsSpy.mock.calls;
    expect(call[0]).toEqual(["ceph/0", "ceph/1"]);
    expect(call[1]).toBe("pause");
    expect(call[2]).toEqual({}); // no options
    executeActionOnUnitsSpy.mockRestore();
  });

  it("submits the action request to the api with options that are required", async () => {
    const executeActionOnUnitsSpy = vi
      .fn()
      .mockImplementation(vi.fn().mockResolvedValue(null));
    vi.spyOn(actionsHooks, "useExecuteActionOnUnits").mockImplementation(
      () => executeActionOnUnitsSpy,
    );
    renderComponent(<ActionsPanel />, { path, url, state });
    await userEvent.click(
      await screen.findByRole("radio", { name: "add-disk" }),
    );
    await userEvent.type(
      await screen.findByRole("textbox", { name: "osd-devices" }),
      "new device",
    );
    expect(
      await screen.findByRole("button", { name: "Run action" }),
    ).not.toBeDisabled();
    await userEvent.click(
      await screen.findByRole("button", { name: "Run action" }),
    );
    await userEvent.click(
      await screen.findByRole("button", {
        name: ConfirmationDialogLabel.CONFIRM_BUTTON,
      }),
    );
    const [call] = executeActionOnUnitsSpy.mock.calls;
    expect(call[0]).toEqual(["ceph/0", "ceph/1"]);
    expect(call[1]).toBe("add-disk");
    expect(call[2]).toEqual({
      bucket: "",
      "osd-devices": "new device",
    });
    executeActionOnUnitsSpy.mockRestore();
  });

  it("should display error when trying to get actions for application", async () => {
    const getActionsForApplicationSpy = vi
      .fn()
      .mockImplementation(
        vi
          .fn()
          .mockRejectedValue(
            new Error("Error while trying to get actions for application!"),
          ),
      );
    vi.spyOn(actionsHooks, "useGetActionsForApplication").mockImplementation(
      () => getActionsForApplicationSpy,
    );
    renderComponent(<ActionsPanel />, { path, url, state });
    expect(getActionsForApplicationSpy).toHaveBeenCalledTimes(1);
    await waitFor(() => {
      expect(getActionsForApplicationSpy).toHaveBeenCalledTimes(1);
    });
    await waitFor(() =>
      expect(
        screen.getByText(ActionsPanelLabel.GET_ACTIONS_ERROR, { exact: false }),
      ).toBeInTheDocument(),
    );
    await userEvent.click(
      screen.getByRole("button", {
        name: "refetching",
      }),
    );
    expect(getActionsForApplicationSpy).toHaveBeenCalledTimes(2);
  });

  it("should display error when trying to submit the action request", async () => {
    const executeActionOnUnitsSpy = vi
      .fn()
      .mockImplementation(
        vi
          .fn()
          .mockRejectedValue(
            new Error("Error while trying to execute action on units!"),
          ),
      );
    vi.spyOn(actionsHooks, "useExecuteActionOnUnits").mockImplementation(
      () => executeActionOnUnitsSpy,
    );
    renderComponent(<ActionsPanel />, { path, url, state });
    expect(
      await screen.findByRole("button", { name: "Run action" }),
    ).toBeDisabled();
    await userEvent.click(await screen.findByRole("radio", { name: "pause" }));
    expect(
      await screen.findByRole("button", { name: "Run action" }),
    ).not.toBeDisabled();
    await userEvent.click(
      await screen.findByRole("button", { name: "Run action" }),
    );
    await userEvent.click(
      await screen.findByRole("button", {
        name: ConfirmationDialogLabel.CONFIRM_BUTTON,
      }),
    );
    await waitFor(() => {
      expect(executeActionOnUnitsSpy).toHaveBeenCalledTimes(1);
    });
    await waitFor(() =>
      expect(
        screen.getByText(ConfirmationDialogLabel.EXECUTE_ACTION_ERROR, {
          exact: false,
        }),
      ).toBeInTheDocument(),
    );
  });

  it("correctly allows for tab navigation", async () => {
    const { result } = renderComponent(<ActionsPanel />, { path, url, state });
    expect(await screen.findByText("2 units selected")).toBeInTheDocument();

    // Select the action.
    await userEvent.click(result.getByLabelText("add-disk"));

    // Select the first field and fill it in.
    await userEvent.click(result.getByLabelText("bucket"));
    await userEvent.keyboard("some value{Tab}");

    // Next field should be focused.
    expect(result.getByLabelText("osd-devices")).toHaveFocus();

    // Fill it in and move on.
    await userEvent.keyboard("another value{Tab}");

    // Run button should be focused
    expect(result.getByRole("button", { name: "Run action" })).toHaveFocus();
  });
});
