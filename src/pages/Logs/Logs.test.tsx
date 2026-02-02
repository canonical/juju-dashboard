import { screen } from "@testing-library/react";
import { vi } from "vitest";

import { AuditLogsTableActionsLabel } from "components/AuditLogsTable/AuditLogsTableActions";
import * as auditLogHooks from "components/AuditLogsTable/hooks";
import { JIMMRelation, JIMMTarget } from "juju/jimm/JIMMV4";
import { PageNotFoundLabel } from "pages/PageNotFound";
import type { RootState } from "store/store";
import { rootStateFactory, jujuStateFactory } from "testing/factories";
import {
  generalStateFactory,
  configFactory,
  controllerFeaturesFactory,
  controllerFeaturesStateFactory,
} from "testing/factories/general";
import {
  auditEventFactory,
  rebacAllowedFactory,
  relationshipTupleFactory,
} from "testing/factories/juju/jimm";
import { auditEventsStateFactory } from "testing/factories/juju/juju";
import { renderComponent } from "testing/utils";

import Logs from "./Logs";

describe("Logs", () => {
  let state: RootState;

  beforeEach(() => {
    vi.spyOn(auditLogHooks, "useFetchAuditEvents").mockReturnValue(vi.fn());
    state = rootStateFactory.build({
      general: generalStateFactory.build({
        config: configFactory.build({
          controllerAPIEndpoint: "wss://example.com/api",
          isJuju: false,
        }),
        controllerConnections: {
          "wss://example.com/api": {
            user: {
              "display-name": "eggman",
              identity: "user-eggman@external",
              "controller-access": "",
              "model-access": "",
            },
          },
        },
        controllerFeatures: controllerFeaturesStateFactory.build({
          "wss://example.com/api": controllerFeaturesFactory.build({
            auditLogs: true,
          }),
        }),
      }),
      juju: jujuStateFactory.build({
        auditEvents: auditEventsStateFactory.build({
          items: [auditEventFactory.build()],
          loaded: true,
        }),
        rebac: {
          allowed: [
            rebacAllowedFactory.build({
              tuple: relationshipTupleFactory.build({
                object: "user-eggman@external",
                relation: JIMMRelation.AUDIT_LOG_VIEWER,
                target_object: JIMMTarget.JIMM_CONTROLLER,
              }),
              allowed: true,
            }),
            rebacAllowedFactory.build({
              tuple: relationshipTupleFactory.build({
                object: "user-eggman@external",
                relation: JIMMRelation.ADMINISTRATOR,
                target_object: JIMMTarget.JIMM_CONTROLLER,
              }),
              allowed: true,
            }),
          ],
        },
      }),
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("doesn't display logs if the feature is disabled", () => {
    state.general.controllerFeatures = controllerFeaturesStateFactory.build({
      "wss://controller.example.com": controllerFeaturesFactory.build({
        rebac: false,
      }),
    });
    renderComponent(<Logs />, { state });
    expect(screen.queryByText("Audit logs")).not.toBeInTheDocument();
    expect(screen.getByText(PageNotFoundLabel.NOT_FOUND)).toBeInTheDocument();
  });

  it("doesn't display logs if the user doesn't have permission", () => {
    state.juju.rebac.allowed = [
      rebacAllowedFactory.build({
        tuple: relationshipTupleFactory.build({
          object: "user-eggman@external",
          relation: JIMMRelation.AUDIT_LOG_VIEWER,
          target_object: JIMMTarget.JIMM_CONTROLLER,
        }),
        allowed: false,
      }),
    ];
    renderComponent(<Logs />, { state });
    expect(screen.queryByText("Audit logs")).not.toBeInTheDocument();
    expect(screen.getByText(PageNotFoundLabel.NOT_FOUND)).toBeInTheDocument();
  });

  it("should render the page", async () => {
    renderComponent(<Logs />, { state });
    expect(screen.getByText("Audit logs")).toBeVisible();
    expect(await screen.findAllByRole("cell")).toHaveLength(6);
  });

  it("should display the actions", () => {
    renderComponent(<Logs />, { state });
    expect(
      screen.getByRole("button", { name: AuditLogsTableActionsLabel.FILTER }),
    ).toBeInTheDocument();
  });
});
