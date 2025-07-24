import userEvent from "@testing-library/user-event";
import { vi } from "vitest";

import * as UserPassForm from "components/LogIn/UserPassForm";
import * as LocalStorage from "hooks/useLocalStorage";
import { rootStateFactory } from "testing/factories";
import { configFactory, generalStateFactory } from "testing/factories/general";
import { renderComponent } from "testing/utils";

import jujuUser from "./juju-user";

const { Title, Widget } = jujuUser;

function loggedInState() {
  return rootStateFactory.build({
    general: generalStateFactory.build({
      config: configFactory.build({
        isJuju: true,
        controllerAPIEndpoint: "wss://jimm.jujucharms.com/api",
      }),
      controllerConnections: {
        "wss://jimm.jujucharms.com/api": {
          controllerTag: "controller",
          serverVersion: "1.2.3",
          user: {
            "display-name": "eggman",
            identity: "user-eggman@external",
            "controller-access": "read",
            "model-access": "write",
          },
        },
      },
    }),
  });
}

function loggedOutState() {
  return rootStateFactory.build({
    general: generalStateFactory.build({
      config: configFactory.build({
        isJuju: true,
        controllerAPIEndpoint: "wss://jimm.jujucharms.com/api",
      }),
      controllerConnections: {},
    }),
  });
}

describe("Title", () => {
  it.for([
    [true, loggedInState()],
    [false, loggedOutState()],
  ] as const)("logged in %s", ([loggedIn, state], { expect }) => {
    const {
      result,
      result: { container },
    } = renderComponent(<Title />, { state });

    expect(container).toHaveTextContent("Juju User");

    const spans = result.baseElement.getElementsByTagName("span");
    expect(spans).toHaveLength(1);
    expect(spans[0]).toHaveClass("show-status");

    if (loggedIn) {
      expect(spans[0]).toHaveClass("positive");
      expect(spans[0]).toHaveTextContent("Logged in");
    } else {
      expect(spans[0]).not.toHaveClass("positive");
      expect(spans[0]).toHaveTextContent("Logged out");
    }
  });
});

describe("Widget", () => {
  describe("credentials", () => {
    it.for([
      ["no credentials", { user: "", password: "" }],
      ["saved credentials", { user: "someone", password: "something" }],
    ] as const)("renders %s", ([_, creds], { expect }) => {
      vi.spyOn(LocalStorage, "default").mockReturnValue([creds, vi.fn()]);

      const { result } = renderComponent(<Widget />, {
        state: loggedOutState(),
      });

      expect(result.getByLabelText("Username")).toHaveValue(creds.user);
      expect(result.getByLabelText("Password")).toHaveValue(creds.password);
    });

    it.for([
      ["no credentials", { user: "", password: "" }],
      ["saved credentials", { user: "someone", password: "something" }],
    ] as const)("edit from %s", async ([_, creds], { expect }) => {
      const saveCreds = vi.fn();
      vi.spyOn(LocalStorage, "default").mockReturnValue([creds, saveCreds]);

      const { result } = renderComponent(<Widget />, {
        state: loggedOutState(),
      });

      const userEl = result.getByLabelText("Username");
      const passwordEl = result.getByLabelText("Password");
      expect(userEl).toHaveValue(creds.user);
      expect(passwordEl).toHaveValue(creds.password);

      await userEvent.type(userEl, "-edited");
      await userEvent.type(passwordEl, "-more");

      expect(saveCreds).not.toHaveBeenCalled();

      await userEvent.click(result.getByText("Save"));

      expect(saveCreds).toHaveBeenCalledExactlyOnceWith({
        user: `${creds.user}-edited`,
        password: `${creds.password}-more`,
      });
    });
  });

  describe("auto login", () => {
    it("can be enabled", async () => {
      const setAutoLogin = vi.fn();
      vi.spyOn(LocalStorage, "default").mockReturnValue([false, setAutoLogin]);

      const loginSpy = vi.spyOn(UserPassForm, "login");

      const { result } = renderComponent(<Widget />, {
        state: loggedOutState(),
      });

      const enabledBox = result.container.querySelector(
        "input[type=checkbox]",
      )!;
      expect(enabledBox).not.toBeChecked();
      expect(loginSpy).not.toHaveBeenCalled();

      await userEvent.click(enabledBox);
      expect(setAutoLogin).toHaveBeenCalledExactlyOnceWith(true);
    });

    it("will auto login", async () => {
      const setAutoLogin = vi.fn();
      vi.spyOn(LocalStorage, "default").mockReturnValue([true, setAutoLogin]);

      const loginSpy = vi.spyOn(UserPassForm, "login");

      const { result } = renderComponent(<Widget />, {
        state: loggedOutState(),
      });

      const enabledBox = result.container.querySelector(
        "input[type=checkbox]",
      )!;
      expect(enabledBox).toBeChecked();

      expect(loginSpy).toHaveBeenCalledTimes(1);
    });
  });
});
