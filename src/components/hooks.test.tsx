import type { ActionCreatorWithPayload } from "@reduxjs/toolkit";
import { createAction } from "@reduxjs/toolkit";
import { renderHook } from "@testing-library/react";
import { MemoryRouter, Outlet, Route, Routes } from "react-router";

import { StatusView } from "layout/Status";
import { rootStateFactory } from "testing/factories";
import {
  ComponentProviders,
  changeURL,
  createStore,
  renderWrappedHook,
} from "testing/utils";

import {
  useEntityDetailsParams,
  useCleanupOnUnmount,
  useModelAppParams,
  useModelIndexParams,
  useStatusView,
} from "./hooks";

describe("useEntityDetailsParams", () => {
  it("retrieve entity details from the URL", () => {
    changeURL("/models/eggman@external/group-test/machine/0");
    const { result } = renderHook(() => useEntityDetailsParams(), {
      wrapper: (props) => (
        <ComponentProviders
          {...props}
          path="/models/:userName/:modelName/machine/:machineId"
          store={createStore(rootStateFactory.build())}
        />
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
    changeURL("/models/eggman@external/group-test/applications");
    const { result } = renderHook(() => useEntityDetailsParams(), {
      wrapper: (props) => (
        <ComponentProviders
          {...props}
          path="/models/:userName/:modelName/applications"
          store={createStore(rootStateFactory.build())}
        />
      ),
    });
    expect(result.current.isNestedEntityPage).toBe(false);
  });

  it("handles nested pages", () => {
    changeURL("/models/eggman@external/group-test/app/etcd");
    const { result } = renderHook(() => useEntityDetailsParams(), {
      wrapper: (props) => (
        <ComponentProviders
          {...props}
          path="/models/:userName/:modelName/app/:appName"
          store={createStore(rootStateFactory.build())}
        />
      ),
    });
    expect(result.current.isNestedEntityPage).toBe(true);
  });
});

describe("useModelIndexParams", () => {
  it("retrieves model parameters from the URL", () => {
    changeURL("/models/eggman@external/group-test");
    const { result } = renderHook(() => useModelIndexParams(), {
      wrapper: (props) => (
        <ComponentProviders
          {...props}
          path="/models/:userName/:modelName"
          store={createStore(rootStateFactory.build())}
        />
      ),
    });
    expect(result.current).toStrictEqual({
      userName: "eggman@external",
      modelName: "group-test",
    });
  });
  it("produces empty object on other URL", () => {
    changeURL("/models/eggman@external/group-test/app/etcd");
    const { result } = renderHook(() => useModelIndexParams(), {
      wrapper: (props) => (
        <ComponentProviders
          {...props}
          path="/models/:userName/:modelName/app/:appName"
          store={createStore(rootStateFactory.build())}
        />
      ),
    });
    expect(result.current).toStrictEqual({});
  });
});

describe("useModelAppParams", () => {
  it("retrieves model app parameters from the URL", () => {
    changeURL("/models/eggman@external/group-test/app/etcd");
    const { result } = renderHook(() => useModelAppParams(), {
      wrapper: (props) => (
        <ComponentProviders
          {...props}
          path="/models/:userName/:modelName/app/:appName"
          store={createStore(rootStateFactory.build())}
        />
      ),
    });
    expect(result.current).toStrictEqual({
      userName: "eggman@external",
      modelName: "group-test",
      appName: "etcd",
    });
  });
  it("produces empty object on other URL", () => {
    changeURL("/models/eggman@external/group-test");
    const { result } = renderHook(() => useModelAppParams(), {
      wrapper: (props) => (
        <ComponentProviders
          {...props}
          path="/models/:userName/:modelName"
          store={createStore(rootStateFactory.build())}
        />
      ),
    });
    expect(result.current).toStrictEqual({});
  });
});

describe("useStatusView", () => {
  it("updates status", () => {
    const setStatus = vi.fn();
    renderHook(() => useStatusView(StatusView.CLI), {
      wrapper: (props) => (
        <MemoryRouter>
          <Routes>
            <Route path="*" element={<Outlet context={{ setStatus }} />}>
              <Route path="*" element={<div {...props}></div>} />
            </Route>
          </Routes>
        </MemoryRouter>
      ),
    });
    expect(setStatus).toHaveBeenCalledWith(StatusView.CLI);
  });

  it("clears the status when component is unmounted", () => {
    const setStatus = vi.fn();
    const result = renderHook(() => useStatusView(StatusView.CLI), {
      wrapper: (props) => (
        <MemoryRouter>
          <Routes>
            <Route path="*" element={<Outlet context={{ setStatus }} />}>
              <Route path="*" element={<div {...props}></div>} />
            </Route>
          </Routes>
        </MemoryRouter>
      ),
    });
    result.unmount();
    expect(setStatus).toHaveBeenCalledWith(null);
  });
});

describe("useCleanupOnUnmount", () => {
  it("dispatches on unmount", () => {
    const action = vi.fn().mockImplementation(createAction("action"));
    const payload = "payload";
    const { unmount } = renderWrappedHook(() =>
      useCleanupOnUnmount(
        action as unknown as ActionCreatorWithPayload<string>,
        true,
        payload,
      ),
    );
    unmount();
    expect(action).toHaveBeenCalledWith(payload);
  });

  it("does not dispatch on unmount if cleanup is not enabled", () => {
    const action = vi.fn().mockImplementation(createAction("action"));
    const payload = "payload";
    const { unmount } = renderWrappedHook(() =>
      useCleanupOnUnmount(
        action as unknown as ActionCreatorWithPayload<string>,
        false,
        payload,
      ),
    );
    unmount();
    expect(action).not.toHaveBeenCalled();
  });

  it("dispatches a updated action on unmount if it changes", () => {
    const firstAction = vi.fn().mockImplementation(createAction("action"));
    const newAction = vi.fn().mockImplementation(createAction("action2"));
    const firstPayload = "payload";
    const newPayload = "payload2";
    type Args = {
      action?: unknown;
      enabled?: boolean;
      payload?: string;
    };
    const { rerender, unmount } = renderWrappedHook(
      ({ action, enabled, payload }: Args = {}) =>
        useCleanupOnUnmount(
          action as unknown as ActionCreatorWithPayload<string>,
          enabled,
          payload,
        ),
      {
        initialProps: {
          action: firstAction,
          enabled: true,
          payload: firstPayload,
        },
      },
    );
    rerender({
      action: newAction,
      enabled: true,
      payload: newPayload,
    });
    unmount();
    // Ideally this test would check that the original cleanup action wasn't
    // called, but RTL unmounts the component when rerendering so it always gets
    // called.
    expect(newAction).toHaveBeenCalledWith(newPayload);
  });
});
