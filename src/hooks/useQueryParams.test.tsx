import { act } from "@testing-library/react";

import { renderWrappedHook } from "testing/utils";

import { useQueryParams } from "./useQueryParams";

describe("useQueryParams", () => {
  afterEach(() => {
    window.happyDOM.setURL("?");
  });

  it("can return default string params", () => {
    const { result } = renderWrappedHook(() =>
      useQueryParams<{ panel: null | string }>({ panel: "config" }),
    );
    const [searchParams] = result.current;
    expect(searchParams.panel).toBe("config");
  });

  it("can return default array params", () => {
    const { result } = renderWrappedHook(() =>
      useQueryParams<{ panels: string[] }>({ panels: ["config", "actions"] }),
    );
    const [searchParams] = result.current;
    expect(searchParams.panels).toStrictEqual(["config", "actions"]);
  });

  it("can return string params from the URL", () => {
    const { result } = renderWrappedHook(
      () => useQueryParams<{ panel: null | string }>({ panel: null }),
      { url: "?panel=config" },
    );
    const [searchParams] = result.current;
    expect(searchParams.panel).toBe("config");
  });

  it("can return array params from the URL", () => {
    const { result } = renderWrappedHook(
      () => useQueryParams<{ panels: string[] }>({ panels: [] }),
      { url: "?panels=config,actions" },
    );
    const [searchParams] = result.current;
    expect(searchParams.panels).toStrictEqual(["config", "actions"]);
  });

  it("should not mutate the initial params", () => {
    const initial = { panels: [] };
    const { result } = renderWrappedHook(
      () => useQueryParams<{ panels: string[] }>(initial),
      { url: "?panels=config,actions" },
    );
    const [searchParams] = result.current;
    expect(searchParams.panels).toStrictEqual(["config", "actions"]);
    expect(initial).toStrictEqual({ panels: [] });
  });

  it("can set string params", () => {
    const { result, router } = renderWrappedHook(() =>
      useQueryParams<{ panel: null | string }>({ panel: null }),
    );
    let [searchParams] = result.current;
    const [_searchParams, setSearchParams] = result.current;
    expect(searchParams.panel).toBeNull();
    expect(router?.state.location.search).toBe("");
    act(() => {
      setSearchParams({ panel: "config" });
    });
    [searchParams] = result.current;
    expect(searchParams.panel).toBe("config");
    expect(router?.state.location.search).toBe("?panel=config");
  });

  it("can set array params", () => {
    const { result, router } = renderWrappedHook(() =>
      useQueryParams<{ panels: string[] }>({ panels: [] }),
    );
    let [searchParams] = result.current;
    const [_searchParams, setSearchParams] = result.current;
    expect(searchParams.panels).toStrictEqual([]);
    expect(router?.state.location.search).toBe("");
    act(() => {
      setSearchParams({ panels: ["config", "actions"] });
    });
    [searchParams] = result.current;
    expect(searchParams.panels).toStrictEqual(["config", "actions"]);
    expect(router?.state.location.search).toBe("?panels=config%2Cactions");
  });

  it("can clear a param", () => {
    const { result, router } = renderWrappedHook(
      () =>
        useQueryParams<{ panel: null | string; other: null | string }>({
          panel: null,
          other: null,
        }),
      { url: "?panel=config&other=something" },
    );
    let [searchParams] = result.current;
    const [_searchParams, setSearchParams] = result.current;
    expect(searchParams.panel).toBe("config");
    act(() => {
      setSearchParams({ panel: null });
    });
    [searchParams] = result.current;
    expect(searchParams.panel).toBeNull();
    expect(router?.state.location.search).toBe("?other=something");
  });

  it("can clear all params", () => {
    const { result, router } = renderWrappedHook(
      () => useQueryParams<{ panel: null | string }>({ panel: null }),
      { url: "?panel=config" },
    );
    let [searchParams] = result.current;
    const [_searchParams, setSearchParams] = result.current;
    expect(searchParams.panel).toBe("config");
    act(() => {
      setSearchParams(null);
    });
    [searchParams] = result.current;
    expect(searchParams.panel).toBeNull();
    expect(router?.state.location.search).toBe("");
  });

  it("should sanitize existing query params value", () => {
    const { result } = renderWrappedHook(
      () => useQueryParams<{ xss: null | string }>({ xss: null }),
      { url: "?xss=<img src=x onerror=alert(1)//>" },
    );
    const [searchParams] = result.current;
    expect(searchParams.xss).toStrictEqual('<img src="x">');
  });

  it("should sanitize existing query params key in url", () => {
    const { result, router } = renderWrappedHook(
      () =>
        useQueryParams<{
          panel: null | string;
        }>({
          panel: null,
        }),
      // Decoded: ?<svg><g/onload=alert(2)//<p>=something
      { url: "?%3Csvg%3E%3Cg%2Fonload%3Dalert(2)%2F%2F%3Cp%3E=something" },
    );
    expect(router?.state.location.search).toStrictEqual(
      // Decoded: ?<svg><g/onload=alert(2)//<p>=something
      "?%3Csvg%3E%3Cg%2Fonload%3Dalert(2)%2F%2F%3Cp%3E=something",
    );
    const [_searchParams, setSearchParams] = result.current;
    act(() => {
      setSearchParams({ panel: "config" });
    });
    expect(router?.state.location.search).toStrictEqual(
      // Decoded: ?panel=config&$<svg><g></g></svg>=something
      "?panel=config&%3Csvg%3E%3Cg%3E%3C%2Fg%3E%3C%2Fsvg%3E=something",
    );
  });

  it("should sanitize query params value after changing it", () => {
    const { result } = renderWrappedHook(() =>
      useQueryParams<{ xss: null | string }>({ xss: null }),
    );
    let [searchParams] = result.current;
    expect(searchParams.xss).toStrictEqual(null);
    const [_searchParams, setSearchParams] = result.current;
    act(() => {
      setSearchParams({ xss: "<img src=x onerror=alert(1)//>" });
    });
    [searchParams] = result.current;
    expect(searchParams.xss).toStrictEqual('<img src="x">');
  });
});
