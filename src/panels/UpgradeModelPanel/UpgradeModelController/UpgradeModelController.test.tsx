import { NotificationSeverity } from "@canonical/react-components";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import type { RootState } from "store/store";
import { rootStateFactory } from "testing/factories";
import {
  generalStateFactory,
  configFactory,
  authUserInfoFactory,
} from "testing/factories/general";
import {
  modelInfoFactory,
  modelUserInfoFactory,
} from "testing/factories/juju/ModelManagerV10";
import {
  controllerFactory,
  jujuStateFactory,
  modelDataFactory,
  modelListInfoFactory,
} from "testing/factories/juju/juju";
import { customWithin } from "testing/queries/within";
import { renderComponent } from "testing/utils";
import urls from "urls";

import { Label as FieldsLabel } from "./Fields/types";
import UpgradeModelController from "./UpgradeModelController";
import { Label } from "./types";

describe("UpgradeModelController", () => {
  let state: RootState;
  const url =
    "/models?panel=upgrade-model&modelName=test1&qualifier=eggman@external";
  const path = urls.models.index;

  beforeEach(() => {
    state = rootStateFactory.build({
      general: generalStateFactory.build({
        config: configFactory.build({
          isJuju: false,
          controllerAPIEndpoint: "wss://example.com/api",
        }),
        controllerConnections: {
          "wss://example.com/api": {
            user: authUserInfoFactory.build(),
          },
        },
      }),
      juju: jujuStateFactory.build({
        controllers: {
          "wss://example.com/api": [
            controllerFactory.build({
              uuid: "controller123",
              "agent-version": "1.2.3",
              name: "controller1",
            }),
          ],
        },
        models: {
          abc123: modelListInfoFactory.build({
            uuid: "abc123",
            name: "test1",
            wsControllerURL: "wss://example.com/api",
          }),
        },
        modelData: {
          abc123: modelDataFactory.build({
            info: modelInfoFactory.build({
              uuid: "abc123",
              name: "test1",
              "controller-uuid": "controller123",
              users: [
                modelUserInfoFactory.build({
                  user: "eggman@external",
                  access: "admin",
                }),
              ],
            }),
          }),
        },
      }),
    });
  });

  it("closes the panel when the form is submitted", async () => {
    const onRemovePanelQueryParams = vi.fn();
    renderComponent(
      <UpgradeModelController
        back={vi.fn}
        onRemovePanelQueryParams={onRemovePanelQueryParams}
        version={{
          date: "2006-01-02",
          lts: true,
          version: "3.6.14",
          "link-to-release":
            "https://github.com/juju/juju/releases/tag/v3.6.14",
          "requires-migration": false,
        }}
        modelName="test1"
        qualifier="eggman@external"
      />,
      { state, url, path },
    );
    await userEvent.click(
      screen.getByRole("checkbox", { name: FieldsLabel.CONFIRM }),
    );
    await userEvent.click(
      await screen.findByRole("button", {
        name: Label.SUBMIT,
      }),
    );
    expect(onRemovePanelQueryParams).toHaveBeenCalled();
  });

  it("displays correctly when a migration is required", async () => {
    const {
      result: { queryNotificationByText },
    } = renderComponent(
      <UpgradeModelController
        back={vi.fn}
        onRemovePanelQueryParams={vi.fn()}
        version={{
          date: "2006-01-02",
          lts: true,
          version: "3.6.14",
          "link-to-release":
            "https://github.com/juju/juju/releases/tag/v3.6.14",
          "requires-migration": true,
        }}
        modelName="test1"
        qualifier="eggman@external"
      />,
      { state, url, path },
    );
    const rows = screen.getAllByRole("row");
    // There should be a header, a model row and then a controller row.
    expect(rows).toHaveLength(3);
    const table = await screen.findByRole("table");
    const controllerCol = customWithin(table).getCellByHeader(
      Label.HEADER_UPGRADE_VERSION,
    );
    expect(controllerCol).toHaveTextContent(/controller1/);
    expect(controllerCol).toHaveTextContent(/1.2.3/);
    expect(
      queryNotificationByText(Label.REQUIRES_MIGRATION, {
        severity: NotificationSeverity.INFORMATION,
      }),
    ).toBeInTheDocument();
  });

  it("requires the controller and confirmation when a migration is required", async () => {
    renderComponent(
      <UpgradeModelController
        back={vi.fn}
        onRemovePanelQueryParams={vi.fn()}
        version={{
          date: "2006-01-02",
          lts: true,
          version: "3.6.14",
          "link-to-release":
            "https://github.com/juju/juju/releases/tag/v3.6.14",
          "requires-migration": true,
        }}
        modelName="test1"
        qualifier="eggman@external"
      />,
      { state, url, path },
    );
    const submit = screen.queryByRole("button", { name: Label.SUBMIT });
    expect(submit).toHaveAttribute("aria-disabled");
    await userEvent.selectOptions(
      screen.getByRole("combobox", { name: FieldsLabel.TARGET_CONTROLLER }),
      "controller_1",
    );
    expect(submit).toHaveAttribute("aria-disabled");
    await userEvent.click(
      screen.getByRole("checkbox", { name: FieldsLabel.CONFIRM }),
    );
    expect(submit).not.toHaveAttribute("aria-disabled");
  });

  it("displays correctly when a migration is not required", async () => {
    const {
      result: { queryNotificationByText },
    } = renderComponent(
      <UpgradeModelController
        back={vi.fn}
        onRemovePanelQueryParams={vi.fn()}
        version={{
          date: "2006-01-02",
          lts: true,
          version: "3.6.14",
          "link-to-release":
            "https://github.com/juju/juju/releases/tag/v3.6.14",
          "requires-migration": false,
        }}
        modelName="test1"
        qualifier="eggman@external"
      />,
      { state, url, path },
    );
    // There should be a header and a model row.
    expect(screen.getAllByRole("row")).toHaveLength(2);
    await waitFor(() => {
      expect(
        queryNotificationByText(Label.REQUIRES_MIGRATION, {
          severity: NotificationSeverity.INFORMATION,
        }),
      ).not.toBeInTheDocument();
    });
  });

  it("requires the confirmation when a migration is required", async () => {
    renderComponent(
      <UpgradeModelController
        back={vi.fn}
        onRemovePanelQueryParams={vi.fn()}
        version={{
          date: "2006-01-02",
          lts: true,
          version: "3.6.14",
          "link-to-release":
            "https://github.com/juju/juju/releases/tag/v3.6.14",
          "requires-migration": false,
        }}
        modelName="test1"
        qualifier="eggman@external"
      />,
      { state, url, path },
    );
    const submit = screen.queryByRole("button", { name: Label.SUBMIT });
    expect(submit).toHaveAttribute("aria-disabled");
    await userEvent.click(
      screen.getByRole("checkbox", { name: FieldsLabel.CONFIRM }),
    );
    expect(submit).not.toHaveAttribute("aria-disabled");
  });
});
