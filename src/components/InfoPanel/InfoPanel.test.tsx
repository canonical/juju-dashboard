import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ReactNode } from "react";
import { vi } from "vitest";

import type { RootState } from "store/store";
import { jujuStateFactory, rootStateFactory } from "testing/factories";
import { applicationStatusFactory } from "testing/factories/juju/ClientV7";
import {
  modelDataFactory,
  modelListInfoFactory,
} from "testing/factories/juju/juju";
import {
  modelWatcherModelDataFactory,
  modelWatcherModelInfoFactory,
} from "testing/factories/juju/model-watcher";
import { renderComponent } from "testing/utils";

import InfoPanel from "./InfoPanel";
import { Label } from "./types";

const TEST_ID = "topology";

vi.mock("components/Topology", () => {
  const Topology = (): ReactNode => <div data-testid={TEST_ID}></div>;
  return { default: Topology };
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
        modelData: {
          abc123: modelDataFactory.build({
            applications: {
              "ceph-mon": applicationStatusFactory.build(),
            },
          }),
        },
        modelWatcherData: {
          abc123: modelWatcherModelDataFactory.build({
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
    expect(screen.getByTestId(TEST_ID)).toBeInTheDocument();
  });

  it("renders the expanded topology on click", async () => {
    renderComponent(<InfoPanel />, { state, url, path });
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    await userEvent.click(screen.getByRole("button"));
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
