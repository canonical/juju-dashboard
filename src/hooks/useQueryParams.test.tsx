import { act, renderHook } from "@testing-library/react";
import type { PropsWithChildren } from "react";
import { Provider } from "react-redux";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import configureStore from "redux-mock-store";

import { rootStateFactory } from "testing/factories";

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

  it("should not mutate the initial params", () => {
    window.history.pushState({}, "", "?panels=config,actions");
    const initial = { panels: [] };
    const { result } = renderHook(
      () => useQueryParams<{ panels: string[] }>(initial),
      {
        wrapper: generateContainer,
      }
    );
    const [searchParams] = result.current;
    expect(searchParams.panels).toStrictEqual(["config", "actions"]);
    expect(initial).toStrictEqual({ panels: [] });
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

  it("should sanitize existing query params value", () => {
    window.history.pushState({}, "", "?xss=<img src=x onerror=alert(1)//>");
    const { result } = renderHook(
      () => useQueryParams<{ xss: string | null }>({ xss: null }),
      {
        wrapper: generateContainer,
      }
    );
    let [searchParams] = result.current;
    expect(searchParams.xss).toStrictEqual('<img src="x">');
  });

  it("should sanitize existing query params value in url without specifying it to change", () => {
    window.history.pushState({}, "", "?xss=<img src=x onerror=alert(1)//>");
    const { result } = renderHook(
      () => useQueryParams<{ panel: string | null }>({ panel: null }),
      {
        wrapper: generateContainer,
      }
    );
    expect(window.location.search).toStrictEqual(
      // Decoded: ?xss=<img src=x onerror=alert(1)//>
      "?xss=%3Cimg%20src=x%20onerror=alert(1)//%3E"
    );
    const [, setSearchParams] = result.current;
    act(() => setSearchParams({ panel: "config" }));
    const [searchParams] = result.current;
    expect(searchParams.panel).toStrictEqual("config");
    expect(window.location.search).toStrictEqual(
      // Decoded: ?xss=<img src="x">&panel=config
      "?xss=%3Cimg+src%3D%22x%22%3E&panel=config"
    );
  });

  it("should sanitize existing query params key in url", () => {
    window.history.pushState(
      {},
      "",
      // Decoded: ?<svg><g/onload=alert(2)//<p>=something
      "?%3Csvg%3E%3Cg%2Fonload%3Dalert(2)%2F%2F%3Cp%3E=something"
    );
    const { result } = renderHook(
      () =>
        useQueryParams<{
          panel: string | null;
        }>({
          panel: null,
        }),
      {
        wrapper: generateContainer,
      }
    );
    expect(window.location.search).toStrictEqual(
      // Decoded: ?<svg><g/onload=alert(2)//<p>=something
      "?%3Csvg%3E%3Cg%2Fonload%3Dalert(2)%2F%2F%3Cp%3E=something"
    );
    const [, setSearchParams] = result.current;
    act(() => setSearchParams({ panel: "config" }));
    expect(window.location.search).toStrictEqual(
      // Decoded: ?panel=config&$<svg><g></g></svg>=something
      "?panel=config&%3Csvg%3E%3Cg%3E%3C%2Fg%3E%3C%2Fsvg%3E=something"
    );
  });

  it("should sanitize query params value after changing it", () => {
    const { result } = renderHook(
      () => useQueryParams<{ xss: string | null }>({ xss: null }),
      {
        wrapper: generateContainer,
      }
    );
    let [searchParams] = result.current;
    expect(searchParams.xss).toStrictEqual(null);
    const [, setSearchParams] = result.current;
    act(() => setSearchParams({ xss: "<img src=x onerror=alert(1)//>" }));
    [searchParams] = result.current;
    expect(searchParams.xss).toStrictEqual('<img src="x">');
  });
});
