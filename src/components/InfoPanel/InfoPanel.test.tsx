import { act, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import type { RootState } from "store/store";
import { jujuStateFactory, rootStateFactory } from "testing/factories";
import { modelListInfoFactory } from "testing/factories/juju/juju";
import {
  applicationInfoFactory,
  modelWatcherModelDataFactory,
  modelWatcherModelInfoFactory,
} from "testing/factories/juju/model-watcher";
import { renderComponent } from "testing/utils";

import InfoPanel, { Label } from "./InfoPanel";

jest.mock("components/Topology/Topology", () => {
  const Topology = () => <div data-testid="topology"></div>;
  return Topology;
});

describe("Info Panel", () => {
  let state: RootState;
  const path = "/models/:userName/:modelName";
  const url = "/models/kirk@external/enterprise";

  beforeEach(() => {
    state = rootStateFactory.build({
      juju: jujuStateFactory.build({
        models: {
          abc123: modelListInfoFactory.build({
            uuid: "abc123",
            name: "enterprise",
            ownerTag: "user-kirk@external",
          }),
        },
        modelWatcherData: {
          abc123: modelWatcherModelDataFactory.build({
            applications: {
              "ceph-mon": applicationInfoFactory.build(),
            },
            model: modelWatcherModelInfoFactory.build({
              name: "enterprise",
              owner: "kirk@external",
            }),
          }),
        },
      }),
    });
  });

  it("renders the topology", () => {
    renderComponent(<InfoPanel />, { state, url, path });
    expect(screen.getByTestId("topology")).toBeInTheDocument();
  });

  it("renders the expanded topology on click", async () => {
    renderComponent(<InfoPanel />, { state, url, path });
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    act(() => screen.getByRole("button").click());
    await waitFor(() => expect(screen.getByRole("dialog")).toBeInTheDocument());
  });

  it("can close the topology", async () => {
    renderComponent(<InfoPanel />, { state, url, path });
    await userEvent.click(
      screen.getByRole("button", { name: Label.EXPAND_BUTTON }),
    );
    expect(screen.getByRole("dialog")).toBeInTheDocument();
    await userEvent.click(
      screen.getByRole("button", { name: "Close active modal" }),
    );
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });
});
