import { act, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { Label as CredentialActionsLabel } from "components/CredentialActions/types";
import { LoadingSpinnerTestId } from "components/LoadingSpinner";
import { RemoveCredentialDialogLabel } from "components/RemoveCredentialDialog";
import { Label as AccordionLabel } from "panels/DestroyModelsPanel/AccordionContent/types";
import { Label as PanelLabel } from "panels/DestroyModelsPanel/types";
import Panels from "panels/Panels";
import { actions as jujuActions } from "store/juju";
import type { RootState } from "store/store";
import { configFactory, generalStateFactory } from "testing/factories/general";
import { modelStatusInfoFactory } from "testing/factories/juju/ClientV8";
import { modelInfoFactory } from "testing/factories/juju/ModelManagerV11";
import {
  cloudInfoStateFactory,
  credentialContentsStateFactory,
  jujuStateFactory,
  modelDataFactory,
  modelListInfoFactory,
  userCredentialsStateFactory,
} from "testing/factories/juju/juju";
import { rootStateFactory } from "testing/factories/root";
import { createStore, renderComponent } from "testing/utils";
import { FeatureFlags } from "types";
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

    it("does not show the spinner if the credentials fail to load", () => {
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
      expect(screen.queryByRole("table")).not.toBeInTheDocument();
      expect(
        screen.queryByRole("heading", { name: Label.NOT_FOUND }),
      ).not.toBeInTheDocument();
    });

    it("does not show the spinner if the cloud info fails to load", () => {
      state.juju.cloudInfo.clouds = null;
      state.juju.cloudInfo.errors = {
        source: "cloud-info",
        message: "Uh oh!",
      };
      state.juju.userCredentials.credentials = {};
      state.juju.userCredentials.loaded = false;
      renderComponent(<CredentialsIndex />, { state });

      expect(screen.getByText(/Uh oh!/)).toBeInTheDocument();
      expect(
        screen.queryByTestId(LoadingSpinnerTestId.LOADING),
      ).not.toBeInTheDocument();
      expect(screen.queryByRole("table")).not.toBeInTheDocument();
      expect(
        screen.queryByRole("heading", { name: Label.NOT_FOUND }),
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

  it("opens the add-credential panel when Add Credential button is clicked", async () => {
    const { router } = renderComponent(<CredentialsIndex />, { state });

    await userEvent.click(
      screen.getByRole("button", { name: Label.ADD_CREDENTIAL }),
    );
    expect(new URLSearchParams(router.state.location.search)).toStrictEqual(
      new URLSearchParams({ panel: "add-credential" }),
    );
  });

  it("disables the Add Credential button when no clouds are available", () => {
    state.juju.cloudInfo.clouds = {};
    renderComponent(<CredentialsIndex />, { state });

    const button = screen.getByRole("button", { name: Label.ADD_CREDENTIAL });
    expect(button).toHaveAttribute("aria-disabled", "true");
  });

  describe("removing a credential that is in use", () => {
    beforeEach(() => {
      localStorage.setItem(
        "flags",
        JSON.stringify([FeatureFlags.REMOVE_CREDENTIAL_WITH_MODELS]),
      );
      state.juju.credentialContents = credentialContentsStateFactory.build({
        contents: {
          [AWS_TAG]: {
            result: {
              content: {
                "auth-type": "access-key",
                cloud: "aws",
                name: "default",
              },
              models: [{ model: "model1", access: "admin" }],
            },
          },
        },
      });
      state.juju.modelData = {
        abc123: modelDataFactory.build({
          uuid: "abc123",
          model: modelStatusInfoFactory.build({ name: "model1" }),
          info: modelInfoFactory.build({ "cloud-credential-tag": AWS_TAG }),
        }),
      };
      state.juju.models = {
        abc123: modelListInfoFactory.build({
          uuid: "abc123",
          canConfigure: true,
        }),
      };
    });

    afterEach(() => {
      localStorage.removeItem("flags");
    });

    it("keeps the dialog open whatever closes the review panel", async () => {
      const { router } = renderComponent(
        <>
          <CredentialsIndex />
          <Panels />
        </>,
        { state },
      );
      const panelIsOpen = (): boolean =>
        new URLSearchParams(router.state.location.search).get("panel") ===
        "destroy-models";
      await userEvent.click(
        within(screen.getByRole("row", { name: /default/ })).getByRole(
          "button",
          { name: CredentialActionsLabel.TOGGLE },
        ),
      );
      await userEvent.click(
        screen.getByRole("menuitem", { name: CredentialActionsLabel.REMOVE }),
      );
      const dialog = screen.getByRole("dialog", {
        name: "Remove credential default",
      });
      await userEvent.click(
        within(dialog).getByRole("button", { name: "Review 1 model" }),
      );
      const panel = screen.getByRole("dialog", { name: "Review 1 model" });
      await userEvent.click(
        within(panel).getByRole("button", {
          name: AccordionLabel.MARK_REVIEWED,
        }),
      );
      await userEvent.click(
        within(panel).getByRole("button", { name: PanelLabel.CANCEL }),
      );
      expect(panelIsOpen()).toBe(false);
      expect(dialog).toBeInTheDocument();
      await userEvent.click(
        within(dialog).getByRole("button", { name: "1/1 Reviewed" }),
      );
      await userEvent.click(within(dialog).getByText(/You cannot remove/));
      expect(panelIsOpen()).toBe(true);
      expect(dialog).toBeInTheDocument();
      await userEvent.click(
        within(dialog).getByRole("button", {
          name: RemoveCredentialDialogLabel.CANCEL,
        }),
      );
      expect(panelIsOpen()).toBe(false);
      expect(dialog).toBeInTheDocument();
      await userEvent.click(
        within(dialog).getByRole("button", {
          name: RemoveCredentialDialogLabel.CANCEL,
        }),
      );
      expect(dialog).not.toBeInTheDocument();
    });
  });
});
