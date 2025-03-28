import { renderHook } from "@testing-library/react";
import type { PropsWithChildren } from "react";
import { Provider } from "react-redux";
import { BrowserRouter, Route, Routes } from "react-router";

import type { RootState } from "store/store";
import { rootStateFactory } from "testing/factories";
import {
  jujuStateFactory,
  modelDataFactory,
  modelDataInfoFactory,
} from "testing/factories/juju/juju";
import { createStore } from "testing/utils";

import useModelStatus from "./useModelStatus";

const generateContainer =
  (state: RootState, path: string, url: string) =>
  ({ children }: PropsWithChildren) => {
    window.happyDOM.setURL(url);
    const store = createStore(state);
    return (
      <Provider store={store}>
        <BrowserRouter>
          <Routes>
            <Route path={path} element={children} />
          </Routes>
        </BrowserRouter>
      </Provider>
    );
  };

describe("useModelStatus", () => {
  it("handles no model name", () => {
    const state = rootStateFactory.build({
      juju: jujuStateFactory.build({
        modelData: {},
      }),
    });
    const { result } = renderHook(() => useModelStatus(), {
      wrapper: generateContainer(state, "*", "/models"),
    });
    expect(result.current).toBeNull();
  });

  it("handles no model data", () => {
    const state = rootStateFactory.build({
      juju: jujuStateFactory.build({
        modelData: {},
      }),
    });
    const { result } = renderHook(() => useModelStatus(), {
      wrapper: generateContainer(
        state,
        "/model/:modelName",
        "/model/test-model",
      ),
    });
    expect(result.current).toBeNull();
  });

  it("can return the model status from the path", () => {
    const modelData = modelDataFactory.build({
      uuid: "abc123",
      info: modelDataInfoFactory.build({
        name: "test-model",
      }),
    });
    const state = rootStateFactory.build({
      juju: jujuStateFactory.build({
        modelData: {
          abc123: modelData,
        },
      }),
    });
    const { result } = renderHook(() => useModelStatus(), {
      wrapper: generateContainer(
        state,
        "/model/:modelName",
        "/model/test-model",
      ),
    });
    expect(result.current).toMatchObject(modelData);
  });

  it("can return the model status from the query string", () => {
    const modelData = modelDataFactory.build({
      uuid: "abc123",
      info: modelDataInfoFactory.build({
        name: "test-model",
      }),
    });
    const state = rootStateFactory.build({
      juju: jujuStateFactory.build({
        modelData: {
          abc123: modelData,
        },
      }),
    });
    const { result } = renderHook(() => useModelStatus(), {
      wrapper: generateContainer(state, "/models", "/models?model=test-model"),
    });
    expect(result.current).toMatchObject(modelData);
  });
});
