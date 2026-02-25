import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { vi } from "vitest";

import * as actionsHooks from "juju/api-hooks/actions";
import { ConfirmType } from "panels/types";
import type { RootState } from "store/store";
import { rootStateFactory } from "testing/factories";
import { applicationCharmActionParamsFactory } from "testing/factories/juju/ActionV7";
import {
  charmInfoFactory,
  charmActionSpecFactory,
} from "testing/factories/juju/Charms";
import {
  applicationStatusFactory,
  unitStatusFactory,
} from "testing/factories/juju/ClientV8";
import { modelInfoFactory } from "testing/factories/juju/ModelManagerV10";
import {
  jujuStateFactory,
  modelDataFactory,
  modelListInfoFactory,
} from "testing/factories/juju/juju";
import { renderComponent } from "testing/utils";

import ConfirmationDialog from "./ConfirmationDialog";
import { Label } from "./types";

describe("ConfirmationDialog", () => {
  let state: RootState;
  const path = "/models/:qualifier/:modelName/app/:appName";
  const url =
    "/models/eggman@external/test-model/app/kubernetes-master?panel=select-charms-and-actions";

  const mockSelectedApplications = {
    ceph: applicationStatusFactory.build({
      units: {
        0: unitStatusFactory.build(),
        1: unitStatusFactory.build(),
      },
    }),
  };

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
        modelData: {
          abc123: modelDataFactory.build({
            applications: {
              ceph: applicationStatusFactory.build({
                units: {
                  0: unitStatusFactory.build(),
                  1: unitStatusFactory.build(),
                  2: unitStatusFactory.build(),
                },
              }),
              mysql: applicationStatusFactory.build({
                units: { 0: unitStatusFactory.build() },
              }),
            },
            info: modelInfoFactory.build({
              name: "test-model",
            }),
            uuid: "abc123",
          }),
        },
        models: {
          abc123: modelListInfoFactory.build({
            uuid: "abc123",
            name: "test-model",
            qualifier: "user-eggman@external",
          }),
        },
      }),
    });
  });

  afterEach(() => {
    vi.resetModules();
    vi.restoreAllMocks();
  });

  it("should return null if the confirm type is not 'submit'", () => {
    const {
      result: { container },
    } = renderComponent(
      <ConfirmationDialog
        confirmType={ConfirmType.CANCEL}
        selectedAction=""
        selectedApplications={{}}
        setConfirmType={vi.fn()}
        selectedActionOptionValue={{}}
        onRemovePanelQueryParams={vi.fn()}
      />,
      { path, state, url },
    );
    expect(container.children.length).toBe(1);
    expect(container.firstChild).toBeEmptyDOMElement();
  });

  it("should display submit confirmation dialog and can cancel running selected action", async () => {
    const mockSetConfirmType = vi.fn();
    renderComponent(
      <ConfirmationDialog
        confirmType={ConfirmType.SUBMIT}
        selectedAction={"stdout"}
        selectedApplications={{
          ceph: applicationStatusFactory.build({
            units: {
              0: unitStatusFactory.build(),
              1: unitStatusFactory.build(),
              2: unitStatusFactory.build(),
            },
          }),
          mysql: applicationStatusFactory.build({
            units: { 0: unitStatusFactory.build() },
          }),
        }}
        setConfirmType={mockSetConfirmType}
        selectedActionOptionValue={{}}
        onRemovePanelQueryParams={vi.fn()}
      />,
      { path, state, url },
    );

    expect(
      screen.getByRole("dialog", { name: "Run stdout?" }),
    ).toBeInTheDocument();
    const cancelButton = screen.getByRole("button", {
      name: Label.CANCEL_BUTTON,
    });
    expect(cancelButton).toBeInTheDocument();
    expect(screen.getByText("2 (4)")).toBeInTheDocument();
    await userEvent.click(cancelButton);
    expect(mockSetConfirmType).toHaveBeenCalledWith(null);
  });

  it("should run selected action and remove panel query params", async () => {
    const mockSetConfirmType = vi.fn();
    const mockOnRemovePanelQueryParams = vi.fn();
    const executeActionOnUnitsSpy = vi
      .fn()
      .mockImplementation(vi.fn().mockResolvedValue(null));
    vi.spyOn(actionsHooks, "useExecuteActionOnUnits").mockImplementation(
      () => executeActionOnUnitsSpy,
    );
    renderComponent(
      <ConfirmationDialog
        confirmType={ConfirmType.SUBMIT}
        selectedAction={"add-disk"}
        selectedApplications={mockSelectedApplications}
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
    const [call] = executeActionOnUnitsSpy.mock.calls;
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
      .mockImplementation(vi.fn().mockRejectedValue(new Error()));
    vi.spyOn(actionsHooks, "useExecuteActionOnUnits").mockImplementation(
      () => executeActionOnUnitsSpy,
    );
    renderComponent(
      <ConfirmationDialog
        confirmType={ConfirmType.SUBMIT}
        selectedAction={"add-disk"}
        selectedApplications={mockSelectedApplications}
        setConfirmType={vi.fn()}
        selectedActionOptionValue={{}}
        onRemovePanelQueryParams={vi.fn()}
      />,
      { state, path, url },
    );
    await userEvent.click(
      screen.getByRole("button", { name: Label.CONFIRM_BUTTON }),
    );
    expect(await screen.findByText(Label.ACTION_ERROR)).toBeInTheDocument();
  });
});
