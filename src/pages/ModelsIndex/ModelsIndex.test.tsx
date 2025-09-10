import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { vi } from "vitest";

import { LoadingSpinnerTestId } from "components/LoadingSpinner";
import type { RootState } from "store/store";
import {
  detailedStatusFactory,
  modelStatusInfoFactory,
} from "testing/factories/juju/ClientV6";
import {
  jujuStateFactory,
  modelDataApplicationFactory,
  modelDataFactory,
  modelDataInfoFactory,
  modelListInfoFactory,
} from "testing/factories/juju/juju";
import { rootStateFactory } from "testing/factories/root";
import { renderComponent } from "testing/utils";
import urls from "urls";

import ModelsIndex from "./ModelsIndex";
import { Label, TestId } from "./types";

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
        modelData: {
          abc123: modelDataFactory.build({
            info: modelDataInfoFactory.build({
              "cloud-tag": "cloud-aws",
            }),
            model: modelStatusInfoFactory.build({
              "cloud-tag": "cloud-aws",
            }),
            applications: {
              easyrsa: modelDataApplicationFactory.build({
                status: detailedStatusFactory.build({
                  status: "blocked",
                }),
              }),
            },
          }),
          def456: modelDataFactory.build({
            info: modelDataInfoFactory.build({
              "cloud-tag": "cloud-gce",
            }),
            model: modelStatusInfoFactory.build({
              "cloud-tag": "cloud-gce",
            }),
            applications: {
              cockroachdb: modelDataApplicationFactory.build({
                status: detailedStatusFactory.build({
                  status: "running",
                }),
              }),
            },
          }),
          ghi789: modelDataFactory.build({
            info: modelDataInfoFactory.build({
              "cloud-tag": "cloud-aws",
            }),
            model: modelStatusInfoFactory.build({
              "cloud-tag": "cloud-aws",
            }),
            applications: {
              elasticsearch: modelDataApplicationFactory.build({
                status: detailedStatusFactory.build({
                  status: "unknown",
                }),
              }),
            },
          }),
        },
        modelsLoaded: true,
      }),
    });
  });

  it("renders without crashing", () => {
    renderComponent(<ModelsIndex />, { state });
    expect(screen.getByText(/3 models/)).toBeInTheDocument();
    expect(screen.getAllByRole("grid")).toHaveLength(3);
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

    expect(screen.getByRole("tab", { name: "Status" })).toHaveAttribute(
      "aria-selected",
      "true",
    );
    const ownerButton = screen.getByRole("tab", { name: "Owner" });
    await userEvent.click(ownerButton);
    expect(ownerButton).toHaveAttribute("aria-selected", "true");
    const searchParams = new URLSearchParams(router.state.location.search);
    expect(searchParams.get("groupedby")).toEqual("owner");
    expect(document.querySelector(".owners-group")).toBeInTheDocument();
  });

  it("should display the correct window title", () => {
    renderComponent(<ModelsIndex />, { state });
    const pageTitle = document.title;
    expect(pageTitle).toEqual("Models | Juju Dashboard");
  });

  it("can filter models via the URL", () => {
    const params = new URLSearchParams({
      cloud: "aws",
    });
    renderComponent(<ModelsIndex />, { state, url: `?${params.toString()}` });
    // There should be two tables, one for each status:
    expect(screen.getAllByRole("grid")).toHaveLength(2);
    // There will be one extra row for each table header:
    expect(screen.getAllByRole("row")).toHaveLength(4);
    expect(screen.getAllByTestId("column-cloud")).toHaveLength(2);
    expect(screen.getAllByTestId("column-cloud")[0]).toHaveTextContent(
      "aws/us-east1",
    );
    expect(screen.getAllByTestId("column-cloud")[1]).toHaveTextContent(
      "aws/us-east1",
    );
  });

  it("can change model filters", async () => {
    const { router } = renderComponent(<ModelsIndex />, { state });
    // There should be three tables, one for each status:
    expect(screen.getAllByRole("grid")).toHaveLength(3);
    // There will be one extra row for each table header:
    expect(screen.getAllByRole("row")).toHaveLength(6);
    await userEvent.click(
      screen.getByRole("searchbox", { name: "Search and filter" }),
    );
    await userEvent.click(screen.getByRole("button", { name: "CLOUD aws" }));
    // There should now be two tables, one for each status:
    expect(screen.getAllByRole("grid")).toHaveLength(2);
    // There will be one extra row for each table header:
    expect(screen.getAllByRole("row")).toHaveLength(4);
    expect(screen.getAllByTestId("column-cloud")).toHaveLength(2);
    expect(screen.getAllByTestId("column-cloud")[0]).toHaveTextContent(
      "aws/us-east1",
    );
    expect(screen.getAllByTestId("column-cloud")[1]).toHaveTextContent(
      "aws/us-east1",
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

  it("should display the error notification", async () => {
    state.juju.modelsError = "Oops!";
    renderComponent(<ModelsIndex />, { state });
    expect(screen.getByText(/Oops!/)).toBeInTheDocument();
  });

  it("clears spinner if initial error occurs", async () => {
    state.juju.modelsLoaded = false;
    state.juju.modelsError = "An error occured";
    const {
      result: { queryAllSpinnersByLabel },
    } = renderComponent(<ModelsIndex />, { state });
    expect(queryAllSpinnersByLabel("Loading")).toHaveLength(0);
    expect(screen.getByText(/An error occured/)).toBeInTheDocument();
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
});
