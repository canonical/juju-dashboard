import { renderHook } from "@testing-library/react";
import { Provider } from "react-redux";
import { rootStateFactory } from "testing/factories";
import configureStore from "redux-mock-store";

import { generalStateFactory } from "testing/factories/general";
import {
  modelListInfoFactory,
  jujuStateFactory,
} from "testing/factories/juju/juju";

import useActiveUsers from "./useActiveUsers";

const mockStore = configureStore([]);

describe("useActiveUsers", () => {
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
          "wss://test.com/api": {
            user: {
              "display-name": "spaceman",
              identity: "user-spaceman@external",
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
          def456: modelListInfoFactory.build({
            wsControllerURL: "wss://test.com/api",
          }),
        },
      }),
    });
    const { result } = renderHook(() => useActiveUsers(), {
      wrapper: ({ children }) => (
        <Provider store={mockStore(state)}>{children}</Provider>
      ),
    });
    expect(result.current).toStrictEqual({
      abc123: "eggman@external",
      def456: "spaceman@external",
    });
  });
});
