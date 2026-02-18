import type { Connection } from "@canonical/jujulib";
import * as jujuLib from "@canonical/jujulib";
import { screen } from "@testing-library/react";
import type { JSX } from "react";
import { vi } from "vitest";

import type { RootState } from "store/store";
import { jujuStateFactory, rootStateFactory } from "testing/factories";
import {
  modelDataFactory,
  modelListInfoFactory,
} from "testing/factories/juju/juju";
import { renderComponent } from "testing/utils";
import urls from "urls";

import ModelDetails from "./ModelDetails";

const APP_TEST_ID = "app";
const MACHINE_TEST_ID = "machine";
const MODEL_TEST_ID = "model";
const UNIT_TEST_ID = "unit";

vi.mock("pages/EntityDetails/App", () => {
  return { default: (): JSX.Element => <div data-testid={APP_TEST_ID}></div> };
});

vi.mock("pages/EntityDetails/Model", () => {
  return {
    default: (): JSX.Element => <div data-testid={MODEL_TEST_ID}></div>,
  };
});

vi.mock("pages/EntityDetails/Unit", () => {
  return { default: (): JSX.Element => <div data-testid={UNIT_TEST_ID}></div> };
});

vi.mock("pages/EntityDetails/Machine", () => {
  return {
    default: (): JSX.Element => <div data-testid={MACHINE_TEST_ID}></div>,
  };
});

vi.mock("@canonical/jujulib", () => ({
  connectAndLogin: vi.fn(),
}));

describe("ModelDetails", () => {
  let state: RootState;
  let client: {
    conn: Connection;
    logout: () => void;
  };
  const path = `${urls.model.index(null)}/*`;
  const url = urls.model.index({
    modelName: "test-model",
    qualifier: "eggman@external",
  });

  beforeEach(() => {
    state = rootStateFactory.withGeneralConfig().build({
      juju: jujuStateFactory.build({
        models: {
          abc123: modelListInfoFactory.build({
            uuid: "abc123",
            name: "test-model",
          }),
        },
        modelData: {
          abc123: modelDataFactory.build(),
        },
      }),
    });
    client = {
      conn: {
        facades: {
          client: {
            fullStatus: vi.fn(),
          },
        },
        transport: {
          close: vi.fn(),
        },
      } as unknown as Connection,
      logout: vi.fn(),
    };
    vi.spyOn(jujuLib, "connectAndLogin").mockImplementation(async () => client);
  });

  afterEach(() => {
    vi.resetAllMocks();
    vi.restoreAllMocks();
  });

  it("should display the model page", async () => {
    renderComponent(<ModelDetails />, { path, url, state });
    expect(await screen.findByTestId(MODEL_TEST_ID)).toBeInTheDocument();
  });

  it("should display the app page", async () => {
    renderComponent(<ModelDetails />, {
      path,
      state,
      url: urls.model.app.index({
        modelName: "test-model",
        qualifier: "eggman@external",
        appName: "ceph",
      }),
    });
    expect(await screen.findByTestId(APP_TEST_ID)).toBeInTheDocument();
  });

  it("should display the unit page", async () => {
    renderComponent(<ModelDetails />, {
      path,
      state,
      url: urls.model.unit({
        modelName: "test-model",
        qualifier: "eggman@external",
        appName: "ceph",
        unitId: "ceph-0",
      }),
    });
    expect(await screen.findByTestId(UNIT_TEST_ID)).toBeInTheDocument();
  });

  it("should display the machine page", async () => {
    renderComponent(<ModelDetails />, {
      path,
      state,
      url: urls.model.machine({
        modelName: "test-model",
        qualifier: "eggman@external",
        machineId: "1",
      }),
    });
    expect(await screen.findByTestId(MACHINE_TEST_ID)).toBeInTheDocument();
  });
});
