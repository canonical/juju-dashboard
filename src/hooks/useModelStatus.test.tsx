import { renderHook } from "@testing-library/react";
import type { PropsWithChildren } from "react";
import { Provider } from "react-redux";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import configureStore from "redux-mock-store";

import type { RootState } from "store/store";
import { rootStateFactory } from "testing/factories";
import {
  jujuStateFactory,
  modelDataFactory,
  modelDataInfoFactory,
} from "testing/factories/juju/juju";

import useModelStatus from "./useModelStatus";

const mockStore = configureStore();

const generateContainer =
  (state: RootState, path: string, url: string) =>
  ({ children }: PropsWithChildren) => {
    window.history.pushState({}, "", url);
    const store = mockStore(state);
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
