import { screen } from "@testing-library/react";
import { vi } from "vitest";

import * as useCanConfigureModelModule from "hooks/useCanConfigureModel";
import type { RootState } from "store/store";
import { configFactory, generalStateFactory } from "testing/factories/general";
import {
  applicationOfferStatusFactory,
  applicationStatusFactory,
  machineStatusFactory,
  remoteApplicationStatusFactory,
  unitStatusFactory,
} from "testing/factories/juju/ClientV8";
import { modelInfoFactory } from "testing/factories/juju/ModelManagerV10";
import {
  jujuStateFactory,
  modelDataFactory,
} from "testing/factories/juju/juju";
import { rootStateFactory } from "testing/factories/root";
import { renderComponent } from "testing/utils";

import AccordionContent from "./AccordionContent";

describe("AccordionContent", () => {
  let state: RootState;

  beforeEach(() => {
    vi.spyOn(
      useCanConfigureModelModule,
      "useCanConfigureModelWithUUID",
    ).mockReturnValue(true);
    state = rootStateFactory.build({
      general: generalStateFactory.build({
        config: configFactory.build({
          controllerAPIEndpoint: "wss://example.com/api",
          isJuju: true,
        }),
      }),
      juju: jujuStateFactory.build({
        modelData: {
          abc123: modelDataFactory.build({
            uuid: "abc123",
            info: modelInfoFactory.build({ name: "test-model" }),
            applications: {
              easyrsa: applicationStatusFactory.build({
                units: { "easyrsa/0": unitStatusFactory.build() },
              }),
            },
            machines: { "0": machineStatusFactory.build() },
          }),
        },
      }),
    });
  });

  it("renders info table", () => {
    state.juju.modelData["abc123"] = modelDataFactory.build({
      uuid: "abc123",
      info: modelInfoFactory.build({ name: "test-model" }),
      applications: {
        easyrsa: applicationStatusFactory.build({
          units: { "easyrsa/0": unitStatusFactory.build() },
        }),
      },
      machines: { "0": machineStatusFactory.build() },
      offers: {
        db: applicationOfferStatusFactory.build({ "total-connected-count": 0 }),
      },
      "remote-applications": {
        mysql: remoteApplicationStatusFactory.build(),
      },
      storage: [
        {
          "storage-tag": "storage-easyrsa-0",
          kind: 0,
          "owner-tag": "admin",
          persistent: true,
          status: { info: "", since: "", status: "" },
        },
      ],
    });
    renderComponent(<AccordionContent modelUUID="abc123" />, { state });
    expect(screen.getByText(/Applications \(1\)/)).toBeInTheDocument();
    expect(screen.getByText(/Machines \(1\)/)).toBeInTheDocument();
    expect(screen.getByText(/Cross-model relations \(2\)/)).toBeInTheDocument();
    expect(screen.getByText(/Attached storage \(1\)/)).toBeInTheDocument();
  });

  it("does not render the info table when there is nothing to show", () => {
    state.juju.modelData["abc123"] = modelDataFactory.build({
      uuid: "abc123",
      info: modelInfoFactory.build({ name: "test-model" }),
    });
    renderComponent(<AccordionContent modelUUID="abc123" />, { state });
    expect(screen.queryByRole("table")).not.toBeInTheDocument();
  });

  it("renders action buttons for a normal model", () => {
    renderComponent(
      <AccordionContent modelUUID="abc123" isController={false} />,
      { state },
    );
    expect(
      screen.getByRole("button", { name: "Remove from selection" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Mark as reviewed" }),
    ).toBeInTheDocument();
  });

  it("hides action buttons when isController is true", () => {
    renderComponent(
      <AccordionContent modelUUID="abc123" isController={true} />,
      { state },
    );
    expect(
      screen.queryByRole("button", { name: "Remove from selection" }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Mark as reviewed" }),
    ).not.toBeInTheDocument();
  });

  it("hides action buttons when user does not have model access", () => {
    vi.spyOn(
      useCanConfigureModelModule,
      "useCanConfigureModelWithUUID",
    ).mockReturnValue(false);
    renderComponent(
      <AccordionContent modelUUID="abc123" isController={false} />,
      { state },
    );
    expect(
      screen.queryByRole("button", { name: "Remove from selection" }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Mark as reviewed" }),
    ).not.toBeInTheDocument();
  });

  it("hides action buttons when model has connected offers", () => {
    state.juju.modelData["abc123"] = modelDataFactory.build({
      uuid: "abc123",
      info: modelInfoFactory.build({ name: "test-model" }),
      offers: {
        db: applicationOfferStatusFactory.build({
          "total-connected-count": 1,
        }),
      },
    });
    renderComponent(
      <AccordionContent modelUUID="abc123" isController={false} />,
      { state },
    );
    expect(
      screen.queryByRole("button", { name: "Remove from selection" }),
    ).not.toBeInTheDocument();
  });
});
