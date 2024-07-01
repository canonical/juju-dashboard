import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { vi } from "vitest";

import * as actionsHooks from "juju/api-hooks/actions";
import { ConfirmType } from "panels/types";
import { renderComponent } from "testing/utils";

import { InlineErrors } from "../types";

import ConfirmationDialog from "./ConfirmationDialog";
import { Label } from "./types";

describe("ConfirmationDialog", () => {
  const path = "/models/:userName/:modelName/app/:appName";
  const url =
    "/models/user-eggman@external/group-test/app/kubernetes-master?panel=execute-action&units=ceph%2F0,ceph%2F1";

  afterEach(() => {
    vi.resetModules();
    vi.restoreAllMocks();
  });

  it("should return null if there is no selected action", async () => {
    const {
      result: { container },
    } = renderComponent(
      <ConfirmationDialog
        confirmType={ConfirmType.SUBMIT}
        selectedAction=""
        selectedUnits={[]}
        setConfirmType={vi.fn()}
        setIsExecutingAction={vi.fn()}
        selectedActionOptionValue={{}}
        handleRemovePanelQueryParams={vi.fn()}
        setInlineErrors={vi.fn()}
      />,
    );
    expect(container.children.length).toBe(1);
    expect(container.firstChild).toBeEmptyDOMElement();
  });

  it("should display submit confirmation dialog and can cancel running selected action", async () => {
    const mockSetConfirmType = vi.fn();
    renderComponent(
      <ConfirmationDialog
        confirmType={ConfirmType.SUBMIT}
        selectedAction="pause"
        selectedUnits={["ceph/0", "ceph/1"]}
        setConfirmType={mockSetConfirmType}
        setIsExecutingAction={vi.fn()}
        selectedActionOptionValue={{}}
        handleRemovePanelQueryParams={vi.fn()}
        setInlineErrors={vi.fn()}
      />,
      { path, url },
    );
    expect(
      screen.getByRole("dialog", { name: "Run pause?" }),
    ).toBeInTheDocument();
    const cancelButton = screen.getByRole("button", {
      name: Label.CANCEL_BUTTON,
    });
    expect(cancelButton).toBeInTheDocument();
    expect(screen.getByText("2")).toBeInTheDocument();
    expect(screen.getByText("ceph/0, 1")).toBeInTheDocument();
    await userEvent.click(cancelButton);
    expect(mockSetConfirmType).toHaveBeenCalledWith(null);
  });

  it("should run selected action and remove panel query params", async () => {
    const mockSetConfirmType = vi.fn();
    const mockOnRemovePanelQueryParams = vi.fn();
    const mockSelectedActionOptionValue = {
      bucket: "",
      "osd-devices": "new device",
    };
    const executeActionOnUnitsSpy = vi
      .fn()
      .mockImplementation(() => Promise.resolve());
    vi.spyOn(actionsHooks, "useExecuteActionOnUnits").mockImplementation(
      () => executeActionOnUnitsSpy,
    );
    renderComponent(
      <ConfirmationDialog
        confirmType={ConfirmType.SUBMIT}
        selectedAction="pause"
        selectedUnits={["ceph/0", "ceph/1"]}
        setConfirmType={mockSetConfirmType}
        setIsExecutingAction={vi.fn()}
        selectedActionOptionValue={mockSelectedActionOptionValue}
        handleRemovePanelQueryParams={mockOnRemovePanelQueryParams}
        setInlineErrors={vi.fn()}
      />,
      { path, url },
    );
    await userEvent.click(
      screen.getByRole("button", { name: Label.CONFIRM_BUTTON }),
    );
    expect(mockSetConfirmType).toHaveBeenCalledWith(null);
    const call = executeActionOnUnitsSpy.mock.calls[0];
    expect(call[0]).toEqual(["ceph/0", "ceph/1"]);
    expect(call[1]).toBe("pause");
    expect(call[2]).toEqual(mockSelectedActionOptionValue);
    expect(mockOnRemovePanelQueryParams).toHaveBeenCalledOnce();
  });

  it("should set inline error if execute action fails", async () => {
    const consoleError = console.error;
    console.error = vi.fn();
    const mockSetInlineErrors = vi.fn();
    const executeActionOnUnitsSpy = vi
      .fn()
      .mockImplementation(() => Promise.reject(new Error("mock error")));
    vi.spyOn(actionsHooks, "useExecuteActionOnUnits").mockImplementation(
      () => executeActionOnUnitsSpy,
    );
    renderComponent(
      <ConfirmationDialog
        confirmType={ConfirmType.SUBMIT}
        selectedAction="pause"
        selectedUnits={["ceph/0", "ceph/1"]}
        setConfirmType={vi.fn()}
        setIsExecutingAction={vi.fn()}
        selectedActionOptionValue={{}}
        handleRemovePanelQueryParams={vi.fn()}
        setInlineErrors={mockSetInlineErrors}
      />,
      { path, url },
    );
    await userEvent.click(
      screen.getByRole("button", { name: Label.CONFIRM_BUTTON }),
    );
    expect(mockSetInlineErrors).toHaveBeenCalledWith(
      InlineErrors.EXECUTE_ACTION,
      Label.EXECUTE_ACTION_ERROR,
    );
    expect(console.error).toHaveBeenCalledWith(
      Label.EXECUTE_ACTION_ERROR,
      new Error("mock error"),
    );
    console.error = consoleError;
  });
});
