import { act, renderHook } from "@testing-library/react";
import { Provider } from "react-redux";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { rootStateFactory } from "testing/factories";
import configureStore from "redux-mock-store";
import { PropsWithChildren } from "react";

import { useQueryParams } from "./useQueryParams";

const mockStore = configureStore();

const generateContainer = ({ children }: PropsWithChildren) => {
  const store = mockStore(rootStateFactory.build());
  return (
    <Provider store={store}>
      <BrowserRouter>
        <Routes>
          <Route path="*" element={children} />
        </Routes>
      </BrowserRouter>
    </Provider>
  );
};

describe("useQueryParams", () => {
  afterEach(() => {
    window.history.pushState({}, "", "?");
  });

  it("can return default string params", () => {
    const { result } = renderHook(
      () => useQueryParams<{ panel: string | null }>({ panel: "config" }),
      {
        wrapper: generateContainer,
      }
    );
    const [searchParams] = result.current;
    expect(searchParams.panel).toBe("config");
  });

  it("can return default array params", () => {
    const { result } = renderHook(
      () =>
        useQueryParams<{ panels: string[] }>({ panels: ["config", "actions"] }),
      {
        wrapper: generateContainer,
      }
    );
    const [searchParams] = result.current;
    expect(searchParams.panels).toStrictEqual(["config", "actions"]);
  });

  it("can return string params from the URL", () => {
    window.history.pushState({}, "", "?panel=config");
    const { result } = renderHook(
      () => useQueryParams<{ panel: string | null }>({ panel: null }),
      {
        wrapper: generateContainer,
      }
    );
    const [searchParams] = result.current;
    expect(searchParams.panel).toBe("config");
  });

  it("can return array params from the URL", () => {
    window.history.pushState({}, "", "?panels=config,actions");
    const { result } = renderHook(
      () => useQueryParams<{ panels: string[] }>({ panels: [] }),
      {
        wrapper: generateContainer,
      }
    );
    const [searchParams] = result.current;
    expect(searchParams.panels).toStrictEqual(["config", "actions"]);
  });

  it("can set string params", () => {
    const { result } = renderHook(
      () => useQueryParams<{ panel: string | null }>({ panel: null }),
      {
        wrapper: generateContainer,
      }
    );
    let [searchParams] = result.current;
    const [, setSearchParams] = result.current;
    expect(searchParams.panel).toBeNull();
    expect(window.location.search).toBe("");
    act(() => setSearchParams({ panel: "config" }));
    [searchParams] = result.current;
    expect(searchParams.panel).toBe("config");
    expect(window.location.search).toBe("?panel=config");
  });

  it("can set array params", () => {
    const { result } = renderHook(
      () => useQueryParams<{ panels: string[] }>({ panels: [] }),
      {
        wrapper: generateContainer,
      }
    );
    let [searchParams] = result.current;
    const [, setSearchParams] = result.current;
    expect(searchParams.panels).toStrictEqual([]);
    expect(window.location.search).toBe("");
    act(() => setSearchParams({ panels: ["config", "actions"] }));
    [searchParams] = result.current;
    expect(searchParams.panels).toStrictEqual(["config", "actions"]);
    expect(window.location.search).toBe("?panels=config%2Cactions");
  });

  it("can clear a param", () => {
    window.history.pushState({}, "", "?panel=config&other=something");
    const { result } = renderHook(
      () =>
        useQueryParams<{ panel: string | null; other: string | null }>({
          panel: null,
          other: null,
        }),
      {
        wrapper: generateContainer,
      }
    );
    let [searchParams] = result.current;
    const [, setSearchParams] = result.current;
    expect(searchParams.panel).toBe("config");
    act(() => setSearchParams({ panel: null }));
    [searchParams] = result.current;
    expect(searchParams.panel).toBeNull();
    expect(window.location.search).toBe("?other=something");
  });

  it("can clear all params", () => {
    window.history.pushState({}, "", "?panel=config");
    const { result } = renderHook(
      () => useQueryParams<{ panel: string | null }>({ panel: null }),
      {
        wrapper: generateContainer,
      }
    );
    let [searchParams] = result.current;
    const [, setSearchParams] = result.current;
    expect(searchParams.panel).toBe("config");
    act(() => setSearchParams(null));
    [searchParams] = result.current;
    expect(searchParams.panel).toBeNull();
    expect(window.location.search).toBe("");
  });
});
