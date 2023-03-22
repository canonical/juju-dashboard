import { renderHook } from "@testing-library/react";
import { Provider } from "react-redux";
import { rootStateFactory } from "testing/factories";
import configureStore from "redux-mock-store";

import { generalStateFactory } from "testing/factories/general";
import {
  modelListInfoFactory,
  jujuStateFactory,
} from "testing/factories/juju/juju";

import useActiveUser from "./useActiveUser";

const mockStore = configureStore([]);

describe("useActiveUser", () => {
  it("retrieve the active user", () => {
    const state = rootStateFactory.build({
      general: generalStateFactory.build({
        controllerConnections: {
          "wss://example.com/api": {
            user: {
              "display-name": "eggman",
              identity: "user-eggman@external",
              "controller-access": "",
              "model-access": "",
            },
          },
        },
      }),
      juju: jujuStateFactory.build({
        models: {
          abc123: modelListInfoFactory.build({
            wsControllerURL: "wss://example.com/api",
          }),
        },
      }),
    });
    const { result } = renderHook(() => useActiveUser("abc123"), {
      wrapper: ({ children }) => (
        <Provider store={mockStore(state)}>{children}</Provider>
      ),
    });
    expect(result.current).toStrictEqual("eggman@external");
  });
});
