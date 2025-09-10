import { act } from "@testing-library/react";

import type { WrappedHookResult } from "testing/utils";
import { renderWrappedHook } from "testing/utils";

import { usePanelQueryParams } from "./hooks";

type Params = { panel: null | string; mockParam: string };

const mockRenderHook = (
  url = "?",
): WrappedHookResult<ReturnType<typeof usePanelQueryParams<Params>>, unknown> =>
  renderWrappedHook(
    () =>
      usePanelQueryParams<Params>({
        panel: null,
        mockParam: "mockValue",
      }),
    {
      url,
    },
  );

describe("usePanelQueryParams", () => {
  it("should initially have the correct query params", () => {
    const { result } = mockRenderHook();
    const [queryParams] = result.current;

    expect(queryParams).toStrictEqual({ panel: null, mockParam: "mockValue" });
  });

  it("should replace default values of query params with those from URL", () => {
    const { result } = mockRenderHook("?panel=mockPanelName");
    const [queryParams] = result.current;

    expect(queryParams).toStrictEqual({
      panel: "mockPanelName",
      mockParam: "mockValue",
    });
  });

  it("should have correct query params after changing a param value", () => {
    const { result } = mockRenderHook();
    const [, setQueryParams] = result.current;

    act(() => {
      setQueryParams({ mockParam: "newMockValue" });
    });

    const [queryParams] = result.current;
    expect(queryParams).toStrictEqual({
      panel: null,
      mockParam: "newMockValue",
    });
  });

  it("should remove all panel params, while leaving the remaining params untouched", () => {
    const { result, router } = mockRenderHook(
      "?externalParam=externalValue&panel=mockPanelName&mockParam=mockValue",
    );
    const [, , handleRemovePanelQueryParams] = result.current;

    act(() => handleRemovePanelQueryParams());

    expect(router?.state.location.search).toBe("?externalParam=externalValue");
  });
});
