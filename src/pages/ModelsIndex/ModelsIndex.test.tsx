import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { vi } from "vitest";

import { LoadingSpinnerTestId } from "components/LoadingSpinner";
import type { RootState } from "store/store";
import { configFactory, generalStateFactory } from "testing/factories/general";
import {
  applicationStatusFactory,
  detailedStatusFactory,
  modelStatusInfoFactory,
} from "testing/factories/juju/ClientV8";
import { modelInfoFactory } from "testing/factories/juju/ModelManagerV10";
import {
  cloudInfoStateFactory,
  jujuStateFactory,
  modelDataFactory,
  modelListInfoFactory,
} from "testing/factories/juju/juju";
import { rootStateFactory } from "testing/factories/root";
import { renderComponent } from "testing/utils";
import urls from "urls";

import ModelsIndex from "./ModelsIndex";
import { Label, TestId } from "./types";

// spell-checker:words groupedby

describe("Models Index page", () => {
  let state: RootState;

  beforeEach(() => {
    state = rootStateFactory.withGeneralConfig().build({
      juju: jujuStateFactory.build({
        models: {
          abc123: modelListInfoFactory.build({
            uuid: "abc123",
            wsControllerURL: "wss://jimm.jujucharms.com/api",
          }),
        },
        cloudInfo: cloudInfoStateFactory.build({
          clouds: {
            "cloud-aws": { type: "ec2" },
            "cloud-gce": { type: "gce" },
          },
        }),
        modelData: {
          abc123: modelDataFactory.build({
            info: modelInfoFactory.build({
              "cloud-tag": "cloud-aws",
            }),
            model: modelStatusInfoFactory.build({
              "cloud-tag": "cloud-aws",
            }),
            applications: {
              easyrsa: applicationStatusFactory.build({
                status: detailedStatusFactory.build({
                  status: "blocked",
                }),
              }),
            },
          }),
          def456: modelDataFactory.build({
            info: modelInfoFactory.build({
              "cloud-tag": "cloud-gce",
            }),
            model: modelStatusInfoFactory.build({
              "cloud-tag": "cloud-gce",
            }),
            applications: {
              cockroachdb: applicationStatusFactory.build({
                status: detailedStatusFactory.build({
                  status: "running",
                }),
              }),
            },
          }),
          ghi789: modelDataFactory.build({
            info: modelInfoFactory.build({
              "cloud-tag": "cloud-aws",
            }),
            model: modelStatusInfoFactory.build({
              "cloud-tag": "cloud-aws",
            }),
            applications: {
              elasticsearch: applicationStatusFactory.build({
                status: detailedStatusFactory.build({
                  status: "unknown",
                }),
              }),
            },
          }),
        },
        modelsLoaded: true,
      }),
      general: generalStateFactory.build({
        config: configFactory.build({
          isJuju: true,
        }),
      }),
    });
  });

  it("renders without crashing", () => {
    renderComponent(<ModelsIndex />, { state });
    expect(screen.getByText(/3 models/)).toBeInTheDocument();
    expect(screen.getAllByRole("table")).toHaveLength(1);
    expect(document.querySelector(".chip-group")).toBeInTheDocument();
  });

  it("displays a spinner while loading models", () => {
    state.juju.modelsLoaded = false;
    renderComponent(<ModelsIndex />, { state });
    expect(
      screen.getByTestId(LoadingSpinnerTestId.LOADING),
    ).toBeInTheDocument();
  });

  it("displays a message if there are no models", () => {
    state.juju.models = {};
    renderComponent(<ModelsIndex />, { state });
    expect(
      screen.getByRole("heading", { name: Label.NOT_FOUND }),
    ).toBeInTheDocument();
  });

  it("displays correct grouping view", async () => {
    const { router } = renderComponent(<ModelsIndex />, {
      state,
      path: urls.models.index,
      url: urls.models.group({ groupedby: "status" }),
    });

    expect(screen.getByRole("tab", { name: "status" })).toHaveAttribute(
      "aria-selected",
      "true",
    );
    const ownerButton = screen.getByRole("tab", { name: "owner" });
    await userEvent.click(ownerButton);
    expect(ownerButton).toHaveAttribute("aria-selected", "true");
    const searchParams = new URLSearchParams(router.state.location.search);
    expect(searchParams.get("groupedby")).toEqual("owner");

    // Find the header, and ensure that it's the first child.
    const header = screen.getByRole("columnheader", { name: "Owner" });
    expect(header.parentElement?.children[0]).toEqual(header);
  });

  it("should display the correct window title", () => {
    renderComponent(<ModelsIndex />, { state });
    const pageTitle = document.title;
    expect(pageTitle).toEqual("Models | Juju Dashboard");
  });

  it.for([
    ["aws", 2],
    ["gce", 1],
  ] as const)(
    "can filter models via the URL (cloud = %s)",
    ([cloud, count], { expect }) => {
      const params = new URLSearchParams({
        cloud,
      });
      renderComponent(<ModelsIndex />, { state, url: `?${params.toString()}` });
      expect(screen.getAllByRole("table")).toHaveLength(1);
      expect(screen.getAllByRole("row")).toHaveLength(count + 1);
      expect(
        screen.getAllByRole("cell", { name: `${cloud}/us-east1` }),
      ).toHaveLength(count);
    },
  );

  it("can change model filters", async () => {
    const { router } = renderComponent(<ModelsIndex />, { state });
    expect(screen.getAllByRole("table")).toHaveLength(1);
    // 3 values + header
    expect(screen.getAllByRole("row")).toHaveLength(4);
    await userEvent.click(
      screen.getByRole("searchbox", { name: "Search and filter" }),
    );
    await userEvent.click(screen.getByRole("button", { name: "CLOUD aws" }));
    expect(screen.getAllByRole("table")).toHaveLength(1);
    // 2 values + header
    expect(screen.getAllByRole("row")).toHaveLength(3);
    expect(screen.getAllByRole("cell", { name: `aws/us-east1` })).toHaveLength(
      2,
    );
    const params = new URLSearchParams({
      cloud: "aws",
      owner: "",
      region: "",
      credential: "",
      custom: "",
    });
    expect(router.state.location.search).toBe(`?${params.toString()}`);
  });

  it("should display the error notification without clearing table", async () => {
    state.juju.modelsError = "Oops!";
    renderComponent(<ModelsIndex />, { state });
    expect(screen.getByText(/Oops!/)).toBeInTheDocument();
    expect(screen.getByText(/3 models/)).toBeInTheDocument();
    expect(screen.getAllByRole("table")).toHaveLength(1);
  });

  it("clears spinner if initial error occurs", async () => {
    state.juju.modelsLoaded = false;
    state.juju.modelsError = "An error occurred";
    const {
      result: { queryAllSpinnersByLabel },
    } = renderComponent(<ModelsIndex />, { state });
    expect(queryAllSpinnersByLabel("Loading")).toHaveLength(0);
    expect(screen.getByText(/An error occurred/)).toBeInTheDocument();
    expect(screen.getByTestId(TestId.COMPONENT).childElementCount).toEqual(1);
  });

  it("should refresh the window when pressing the button in error notification", async () => {
    const { location } = window;
    Object.defineProperty(window, "location", {
      value: { ...location, reload: vi.fn() },
    });

    state.juju.modelsError = "Oops!";
    renderComponent(<ModelsIndex />, { state });
    await userEvent.click(screen.getByRole("button", { name: "refreshing" }));
    expect(window.location.reload).toHaveBeenCalled();

    Object.defineProperty(window, "location", {
      value: location,
    });
  });

  it("should navigate to AddModel page when Add Model button is clicked", async () => {
    const { router } = renderComponent(<ModelsIndex />, { state });
    const addButton = screen.getByRole("button", {
      name: "Add model",
    });
    await userEvent.click(addButton);
    expect(router.state.location.pathname).toEqual(urls.models.addModel);
  });
});
