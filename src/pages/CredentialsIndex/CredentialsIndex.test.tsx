import { act, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { LoadingSpinnerTestId } from "components/LoadingSpinner";
import { actions as jujuActions } from "store/juju";
import type { RootState } from "store/store";
import { configFactory, generalStateFactory } from "testing/factories/general";
import {
  cloudInfoStateFactory,
  jujuStateFactory,
  userCredentialsStateFactory,
} from "testing/factories/juju/juju";
import { rootStateFactory } from "testing/factories/root";
import { createStore, renderComponent } from "testing/utils";
import { externalURLs } from "urls";

import CredentialsIndex from "./CredentialsIndex";
import { Label } from "./types";

describe("CredentialsIndex", () => {
  const WS_URL = "wss://controller.example.com";
  const AWS_TAG = "cloudcred-aws_admin_default";
  const GCE_TAG = "cloudcred-gce_admin_secondary";
  let state: RootState;

  beforeEach(() => {
    state = rootStateFactory.build({
      general: generalStateFactory.build({
        config: configFactory.build({ controllerAPIEndpoint: WS_URL }),
        controllerConnections: {
          [WS_URL]: { user: { identity: "user-eggman@external" } },
        },
      }),
      juju: jujuStateFactory.build({
        cloudInfo: cloudInfoStateFactory.build({
          clouds: {
            "cloud-aws": { type: "ec2" },
            "cloud-gce": { type: "gce" },
          },
        }),
        userCredentials: userCredentialsStateFactory.build({
          credentials: { "cloud-aws": [AWS_TAG], "cloud-gce": [GCE_TAG] },
          loaded: true,
        }),
      }),
    });
  });

  it("renders the credentials count and table", () => {
    renderComponent(<CredentialsIndex />, { state });

    expect(screen.getByText(/2 credentials/)).toBeInTheDocument();
    expect(screen.getByRole("table")).toBeInTheDocument();
    expect(screen.getAllByRole("row")).toHaveLength(3);
  });

  describe("no credentials", () => {
    it("shows a message instead of the filters and table", () => {
      state.juju.userCredentials.credentials = {
        "cloud-aws": [],
        "cloud-gce": [],
      };
      renderComponent(<CredentialsIndex />, { state });

      expect(
        screen.getByRole("heading", { name: Label.NOT_FOUND }),
      ).toBeInTheDocument();
      expect(
        screen.getByRole("link", { name: "adding credentials" }),
      ).toHaveAttribute("href", externalURLs.cliHelpCommand("add-credential"));
      expect(screen.queryByRole("table")).not.toBeInTheDocument();
      expect(
        screen.queryByRole("searchbox", { name: "Search and filter" }),
      ).not.toBeInTheDocument();
    });

    it("shows the message if there are no clouds", () => {
      state.juju.cloudInfo.clouds = {};
      state.juju.userCredentials.credentials = {};
      state.juju.userCredentials.loaded = false;
      renderComponent(<CredentialsIndex />, { state });

      expect(
        screen.getByRole("heading", { name: Label.NOT_FOUND }),
      ).toBeInTheDocument();
    });

    it("shows the message if the credentials of some clouds failed to load", () => {
      // The credentials of a cloud that failed to load are not in the state.
      state.juju.userCredentials.credentials = { "cloud-aws": [] };
      renderComponent(<CredentialsIndex />, { state });

      expect(
        screen.getByRole("heading", { name: Label.NOT_FOUND }),
      ).toBeInTheDocument();
    });

    it("shows the message if the credentials of every cloud failed to load", () => {
      state.juju.userCredentials.credentials = {};
      renderComponent(<CredentialsIndex />, { state });

      expect(
        screen.getByRole("heading", { name: Label.NOT_FOUND }),
      ).toBeInTheDocument();
      expect(
        screen.queryByTestId(LoadingSpinnerTestId.LOADING),
      ).not.toBeInTheDocument();
    });
  });

  describe("loading", () => {
    it("shows a spinner while the clouds have not loaded", () => {
      state.juju.cloudInfo.clouds = null;
      state.juju.userCredentials.credentials = {};
      state.juju.userCredentials.loaded = false;
      renderComponent(<CredentialsIndex />, { state });

      expect(
        screen.getByTestId(LoadingSpinnerTestId.LOADING),
      ).toBeInTheDocument();
      expect(
        screen.queryByRole("heading", { name: Label.NOT_FOUND }),
      ).not.toBeInTheDocument();
      expect(screen.queryByRole("table")).not.toBeInTheDocument();
    });

    it("shows a spinner until the credentials have been received", () => {
      state.juju.userCredentials.credentials = {};
      state.juju.userCredentials.loaded = false;
      renderComponent(<CredentialsIndex />, { state });

      expect(
        screen.getByTestId(LoadingSpinnerTestId.LOADING),
      ).toBeInTheDocument();
      expect(
        screen.queryByRole("heading", { name: Label.NOT_FOUND }),
      ).not.toBeInTheDocument();
      expect(screen.queryByRole("table")).not.toBeInTheDocument();
    });

    it("does not show the spinner if there is an error", () => {
      state.juju.cloudInfo.clouds = null;
      state.juju.userCredentials.credentials = {};
      state.juju.userCredentials.loaded = false;
      state.juju.userCredentials.errors = {
        source: "user-credentials",
        message: "Uh oh!",
      };
      renderComponent(<CredentialsIndex />, { state });

      expect(screen.getByText(/Uh oh!/)).toBeInTheDocument();
      expect(
        screen.queryByTestId(LoadingSpinnerTestId.LOADING),
      ).not.toBeInTheDocument();
    });

    it("does not show the message for there being no credentials until the credentials have loaded", () => {
      state.juju.cloudInfo.clouds = null;
      state.juju.userCredentials.credentials = {};
      state.juju.userCredentials.loaded = false;
      const store = createStore(state);
      renderComponent(<CredentialsIndex />, { store });
      const message = (): HTMLElement | null =>
        screen.queryByRole("heading", { name: Label.NOT_FOUND });
      expect(message()).not.toBeInTheDocument();

      // The cloud info loads, and then the credentials are requested.
      act(() => {
        store.dispatch(
          jujuActions.updateCloudInfo({
            update: { data: { "cloud-aws": { type: "ec2" } } },
          }),
        );
      });
      expect(message()).not.toBeInTheDocument();
      act(() => {
        store.dispatch(
          jujuActions.updateUserCredentials({ update: { loading: true } }),
        );
      });
      expect(message()).not.toBeInTheDocument();

      // It is only known that there are no credentials once the response is
      // received, even if the response doesn't contain any credentials.
      act(() => {
        store.dispatch(
          jujuActions.updateUserCredentials({ update: { data: {} } }),
        );
      });
      expect(message()).toBeInTheDocument();
    });
  });

  it.for([
    ["cloud", "gce", "secondary"],
    ["credential", "default", "default"],
    ["custom", "second", "secondary"],
  ] as const)(
    "can filter credentials via the URL (%s = %s)",
    ([param, value, name], { expect }) => {
      renderComponent(<CredentialsIndex />, {
        state,
        url: `?${new URLSearchParams({ [param]: value })}`,
      });

      // 1 credential + header
      expect(screen.getAllByRole("row")).toHaveLength(2);
      expect(screen.getByRole("cell", { name })).toBeInTheDocument();
    },
  );

  it("can change the filters", async () => {
    const { router } = renderComponent(<CredentialsIndex />, { state });
    // 2 credentials + header
    expect(screen.getAllByRole("row")).toHaveLength(3);

    await userEvent.click(
      screen.getByRole("searchbox", { name: "Search and filter" }),
    );
    await userEvent.click(screen.getByRole("button", { name: "CLOUD aws" }));

    // 1 credential + header
    expect(screen.getAllByRole("row")).toHaveLength(2);
    expect(screen.getByRole("cell", { name: "default" })).toBeInTheDocument();
    const params = new URLSearchParams(router.state.location.search);
    expect(params.get("cloud")).toBe("aws");
  });

  it("only offers filters for the cloud and credential name", async () => {
    renderComponent(<CredentialsIndex />, { state });

    await userEvent.click(
      screen.getByRole("searchbox", { name: "Search and filter" }),
    );

    expect(
      screen.getByRole("button", { name: "CLOUD aws" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "CLOUD gce" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "CREDENTIAL secondary" }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: /^(REGION|OWNER)/ }),
    ).not.toBeInTheDocument();
  });

  it("refreshes the window from the error notification", async () => {
    const { location } = window;
    Object.defineProperty(window, "location", {
      value: { ...location, reload: vi.fn() },
    });

    state.juju.credentialContents.errors = {
      source: "credential-contents",
      message: "Uh oh!",
    };
    renderComponent(<CredentialsIndex />, { state });
    await userEvent.click(screen.getByRole("button", { name: "refreshing" }));
    expect(window.location.reload).toHaveBeenCalled();

    Object.defineProperty(window, "location", {
      value: location,
    });
  });
});
