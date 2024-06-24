import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { vi, type Mock } from "vitest";

import * as actionsHooks from "juju/api-hooks/actions";
import { ConfirmType } from "panels/types";
import type { RootState } from "store/store";
import { rootStateFactory } from "testing/factories";
import { applicationCharmActionParamsFactory } from "testing/factories/juju/ActionV7";
import {
  charmInfoFactory,
  charmActionSpecFactory,
} from "testing/factories/juju/Charms";
import { jujuStateFactory } from "testing/factories/juju/juju";
import { renderComponent } from "testing/utils";

import ConfirmationDialog from "./ConfirmationDialog";
import { Label } from "./types";

describe("ConfirmationDialog", () => {
  let state: RootState;
  const path = "/models/:userName/:modelName/app/:appName";
  const url =
    "/models/user-eggman@external/group-test/app/kubernetes-master?panel=select-charms-and-actions";

  const mockSelectedApplcations = [
    {
      "unit-count": 2,
      "model-uuid": "816d67b1-4942-4420-8be2-07df30f7a1ce",
      name: "ceph",
      exposed: false,
      "charm-url": "ch:ceph",
      "owner-tag": "",
      life: "alive",
      "min-units": 0,
      constraints: { arch: "amd64" },
      subordinate: false,
      status: {
        current: "active",
        message: "",
        since: "2023-01-26T06:41:05.303171453Z",
        version: "",
      },
      "workload-version": "",
    },
  ];
  let mockSetConfirmType: Mock;
  let mockOnRemovePanelQueryParams: Mock;

  beforeAll(() => {
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
              },
            },
          }),
        ],
      }),
    });
    mockSetConfirmType = vi.fn();
    mockOnRemovePanelQueryParams = vi.fn();
  });

  afterEach(() => {
    vi.resetModules();
    vi.restoreAllMocks();
  });

  it("should return null if there is no selected action", () => {
    const {
      result: { container },
    } = renderComponent(
      <ConfirmationDialog
        confirmType={ConfirmType.SUBMIT}
        selectedAction={undefined}
        selectedApplications={[]}
        setConfirmType={vi.fn()}
        selectedActionOptionValue={undefined}
        onRemovePanelQueryParams={vi.fn()}
      />,
    );
    expect(container.tagName).toBe("DIV");
    expect(container.children.length).toBe(1);
    expect(container.firstChild).toBeEmptyDOMElement();
  });

  it("should display submit confirmation dialog and can cancel running selected action", async () => {
    renderComponent(
      <ConfirmationDialog
        confirmType={ConfirmType.SUBMIT}
        selectedAction={"stdout"}
        selectedApplications={[{ "unit-count": 3 }, { "unit-count": 1 }]}
        setConfirmType={mockSetConfirmType}
        selectedActionOptionValue={undefined}
        onRemovePanelQueryParams={vi.fn()}
      />,
    );

    expect(
      screen.getByRole("dialog", { name: "Run stdout?" }),
    ).toBeInTheDocument();
    const cancelButton = screen.getByRole("button", {
      name: Label.CANCEL_BUTTON,
    });
    expect(cancelButton).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: Label.CONFIRM_BUTTON }),
    ).toBeInTheDocument();
    expect(
      screen.getByText("APPLICATION COUNT (UNIT COUNT)"),
    ).toBeInTheDocument();
    expect(screen.getByText("2 (4)")).toBeInTheDocument();
    await userEvent.click(cancelButton);
    expect(mockSetConfirmType).toHaveBeenCalledWith(null);
  });

  it("should run selected action and remove panel query params", async () => {
    const executeActionOnUnitsSpy = vi
      .fn()
      .mockImplementation(() => Promise.resolve());
    vi.spyOn(actionsHooks, "useExecuteActionOnUnits").mockImplementation(
      () => executeActionOnUnitsSpy,
    );
    renderComponent(
      <ConfirmationDialog
        confirmType={ConfirmType.SUBMIT}
        selectedAction={"add-disk"}
        selectedApplications={mockSelectedApplcations}
        setConfirmType={mockSetConfirmType}
        selectedActionOptionValue={{
          bucket: "",
          "osd-devices": "new device",
        }}
        onRemovePanelQueryParams={mockOnRemovePanelQueryParams}
      />,
      { state, path, url },
    );
    await userEvent.click(
      screen.getByRole("button", { name: Label.CONFIRM_BUTTON }),
    );
    expect(mockSetConfirmType).toHaveBeenCalledWith(null);
    const call = executeActionOnUnitsSpy.mock.calls[0];
    expect(call[1]).toBe("add-disk");
    expect(call[0]).toEqual(["ceph-0", "ceph-1"]);
    expect(call[2]).toEqual({
      bucket: "",
      "osd-devices": "new device",
    });
    expect(await screen.findByText(Label.ACTION_SUCCESS)).toBeInTheDocument();
    expect(mockOnRemovePanelQueryParams).toHaveBeenCalledOnce();
  });

  it("should display error toast if action fails", async () => {
    const executeActionOnUnitsSpy = vi
      .fn()
      .mockImplementation(() => Promise.reject(new Error()));
    vi.spyOn(actionsHooks, "useExecuteActionOnUnits").mockImplementation(
      () => executeActionOnUnitsSpy,
    );
    renderComponent(
      <ConfirmationDialog
        confirmType={ConfirmType.SUBMIT}
        selectedAction={"add-disk"}
        selectedApplications={mockSelectedApplcations}
        setConfirmType={mockSetConfirmType}
        selectedActionOptionValue={{}}
        onRemovePanelQueryParams={mockOnRemovePanelQueryParams}
      />,
      { state, path, url },
    );
    await userEvent.click(
      screen.getByRole("button", { name: Label.CONFIRM_BUTTON }),
    );
    expect(mockSetConfirmType).toHaveBeenCalledWith(null);
    const call = executeActionOnUnitsSpy.mock.calls[0];
    expect(call[1]).toBe("add-disk");
    expect(call[0]).toEqual(["ceph-0", "ceph-1"]);
    expect(call[2]).toEqual({});
    expect(await screen.findByText(Label.ACTION_ERROR)).toBeInTheDocument();
    expect(mockOnRemovePanelQueryParams).toHaveBeenCalledOnce();
  });
});
