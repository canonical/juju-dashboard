import { renderHook } from "@testing-library/react";
import { Provider } from "react-redux";
import { Route, Routes, MemoryRouter } from "react-router-dom";
import { rootStateFactory } from "testing/factories";
import configureStore from "redux-mock-store";

import { useEntityDetailsParams } from "./hooks";

const mockStore = configureStore([]);

describe("useEntityDetailsParams", () => {
  it("retrieve entity details from the URL", () => {
    const { result } = renderHook(() => useEntityDetailsParams(), {
      wrapper: ({ children }) => (
        <Provider store={mockStore(rootStateFactory.build())}>
          <MemoryRouter
            initialEntries={["/models/eggman@external/group-test/machine/0"]}
          >
            <Routes>
              <Route
                path="/models/:userName/:modelName/machine/:machineId"
                element={children}
              />
            </Routes>
          </MemoryRouter>
        </Provider>
      ),
    });
    expect(result.current).toStrictEqual({
      appName: undefined,
      isNestedEntityPage: true,
      machineId: "0",
      modelName: "group-test",
      unitId: undefined,
      userName: "eggman@external",
    });
  });

  it("handles non nested pages", () => {
    const { result } = renderHook(() => useEntityDetailsParams(), {
      wrapper: ({ children }) => (
        <Provider store={mockStore(rootStateFactory.build())}>
          <MemoryRouter
            initialEntries={["/models/eggman@external/group-test/applications"]}
          >
            <Routes>
              <Route
                path="/models/:userName/:modelName/applications"
                element={children}
              />
            </Routes>
          </MemoryRouter>
        </Provider>
      ),
    });
    expect(result.current.isNestedEntityPage).toBe(false);
  });

  it("handles nested pages", () => {
    const { result } = renderHook(() => useEntityDetailsParams(), {
      wrapper: ({ children }) => (
        <Provider store={mockStore(rootStateFactory.build())}>
          <MemoryRouter
            initialEntries={["/models/eggman@external/group-test/app/etcd"]}
          >
            <Routes>
              <Route
                path="/models/:userName/:modelName/app/:appName"
                element={children}
              />
            </Routes>
          </MemoryRouter>
        </Provider>
      ),
    });
    expect(result.current.isNestedEntityPage).toBe(true);
  });
});
