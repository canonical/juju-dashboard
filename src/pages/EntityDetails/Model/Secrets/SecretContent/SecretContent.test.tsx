import { Label as ActionButtonLabel } from "@canonical/react-components/dist/components/ActionButton/ActionButton";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { vi } from "vitest";

import { RevisionFieldLabel } from "components/secrets/RevisionField";
import * as secretHooks from "juju/api-hooks/secrets";
import { actions as jujuActions } from "store/juju";
import type { RootState } from "store/store";
import { rootStateFactory } from "testing/factories";
import {
  configFactory,
  generalStateFactory,
  credentialFactory,
} from "testing/factories/general";
import {
  modelListInfoFactory,
  secretsStateFactory,
  listSecretResultFactory,
  modelSecretsFactory,
  secretRevisionFactory,
} from "testing/factories/juju/juju";
import { modelSecretsContentFactory } from "testing/factories/juju/juju";
import { createStore, renderComponent } from "testing/utils";
import urls from "urls";

import SecretContent from "./SecretContent";
import { Label } from "./types";

vi.mock("juju/api-hooks/secrets", () => {
  return {
    useGetSecretContent: vi.fn().mockReturnValue(vi.fn()),
  };
});

describe("SecretContent", () => {
  let state: RootState;
  const path = urls.model.index(null);
  const url = urls.model.index({
    userName: "eggman@external",
    modelName: "test-model",
  });

  beforeEach(() => {
    vi.spyOn(secretHooks, "useGetSecretContent").mockImplementation(() =>
      vi.fn(),
    );
    state = rootStateFactory.build({
      general: generalStateFactory.build({
        credentials: {
          "wss://example.com/api": credentialFactory.build(),
        },
        config: configFactory.build({
          controllerAPIEndpoint: "wss://example.com/api",
        }),
      }),
      juju: {
        models: {
          abc123: modelListInfoFactory.build({
            wsControllerURL: "wss://example.com/api",
            uuid: "abc123",
          }),
        },
        secrets: secretsStateFactory.build({
          abc123: modelSecretsFactory.build({
            items: [
              listSecretResultFactory.build({
                uri: "secret:aabbccdd",
                label: "secret1",
                "latest-revision": 3,
                revisions: [
                  secretRevisionFactory.build({ revision: 1 }),
                  secretRevisionFactory.build({ revision: 2 }),
                  secretRevisionFactory.build({ revision: 3 }),
                ],
              }),
            ],
            loaded: true,
          }),
        }),
      },
    });
  });

  it("initially hides the modal", async () => {
    const store = createStore(state);
    renderComponent(<SecretContent secretURI="secret:aabbccdd" />, {
      store,
      path,
      url,
    });
    expect(
      screen.getByRole("button", { name: Label.SHOW }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("dialog", { name: Label.MODAL_TITLE }),
    ).not.toBeInTheDocument();
  });

  it("can open the modal", async () => {
    const store = createStore(state);
    renderComponent(<SecretContent secretURI="secret:aabbccdd" />, {
      store,
      path,
      url,
    });
    await userEvent.click(screen.getByRole("button", { name: Label.SHOW }));
    expect(
      screen.getByRole("dialog", { name: Label.MODAL_TITLE }),
    ).toBeInTheDocument();
  });

  it("cleans up secrets when closing the modal", async () => {
    const [store, actions] = createStore(state, { trackActions: true });
    renderComponent(<SecretContent secretURI="secret:aabbccdd" />, {
      store,
      path,
      url,
    });
    const clearAction = jujuActions.clearSecretsContent({
      modelUUID: "abc123",
      wsControllerURL: "wss://example.com/api",
    });
    await userEvent.click(screen.getByRole("button", { name: Label.SHOW }));
    await userEvent.click(
      screen.getByRole("button", { name: "Close active modal" }),
    );
    await waitFor(() => {
      expect(
        actions.find((dispatch) => dispatch.type === clearAction.type),
      ).toMatchObject(clearAction);
    });
  });

  it("can fetch the content for the chosen revision", async () => {
    const getSecretContent = vi.fn();
    vi.spyOn(secretHooks, "useGetSecretContent").mockImplementation(
      () => getSecretContent,
    );
    renderComponent(<SecretContent secretURI="secret:aabbccdd" />, {
      state,
      path,
      url,
    });
    await userEvent.click(screen.getByRole("button", { name: Label.SHOW }));
    await userEvent.selectOptions(
      screen.getByRole("combobox", { name: RevisionFieldLabel.REVISION }),
      "3 (latest)",
    );
    await userEvent.click(screen.getByRole("button", { name: Label.SUBMIT }));
    expect(getSecretContent).toHaveBeenCalledWith("secret:aabbccdd", 3);
  });

  it("displays the loading state", async () => {
    state.juju.secrets.abc123.content = modelSecretsContentFactory.build({
      loading: true,
    });
    renderComponent(<SecretContent secretURI="secret:aabbccdd" />, {
      state,
      path,
      url,
    });
    await userEvent.click(screen.getByRole("button", { name: Label.SHOW }));
    expect(
      screen.getByLabelText(ActionButtonLabel.WAITING),
    ).toBeInTheDocument();
  });

  it("can display content", async () => {
    state.juju.secrets.abc123.content = modelSecretsContentFactory.build({
      loaded: true,
      content: { "a key": btoa("a value") },
    });
    renderComponent(<SecretContent secretURI="secret:aabbccdd" />, {
      state,
      path,
      url,
    });
    await userEvent.click(screen.getByRole("button", { name: Label.SHOW }));
    expect(screen.getByRole("heading", { name: "a key" })).toBeInTheDocument();
    expect(screen.getByText("a value")).toBeInTheDocument();
  });

  it("can display content when no secrets", async () => {
    state.juju.secrets = secretsStateFactory.build();
    renderComponent(<SecretContent secretURI="secret:aabbccdd" />, {
      state,
      path,
      url,
    });
    await userEvent.click(screen.getByRole("button", { name: Label.SHOW }));
    expect(screen.queryByRole("heading", { name: "a key" })).toBeNull();
    expect(
      document.querySelector(".p-code-snippet__block"),
    ).not.toBeInTheDocument();
  });

  it("can display content errors", async () => {
    state.juju.secrets.abc123.content = modelSecretsContentFactory.build({
      loaded: true,
      errors: "Uh oh!",
    });
    renderComponent(<SecretContent secretURI="secret:aabbccdd" />, {
      state,
      path,
      url,
    });
    await userEvent.click(screen.getByRole("button", { name: Label.SHOW }));
    expect(screen.getByText("Uh oh!")).toBeInTheDocument();
  });
});
