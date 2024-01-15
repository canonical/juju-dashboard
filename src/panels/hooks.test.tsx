import { act, renderHook } from "@testing-library/react";
import configureStore from "redux-mock-store";

import type { RootState } from "store/store";
import { rootStateFactory } from "testing/factories";
import { ComponentProviders, changeURL } from "testing/utils";

import { usePanelQueryParams } from "./hooks";

const mockStore = configureStore<RootState, unknown>([]);

const mockRenderHook = () =>
  renderHook(
    () =>
      usePanelQueryParams<{ panel: null | string; mockParam: string }>({
        panel: null,
        mockParam: "mockValue",
      }),
    {
      wrapper: (props) => (
        <ComponentProviders
          {...props}
          path=""
          store={mockStore(rootStateFactory.build())}
        />
      ),
    },
  );

describe("usePanelQueryParams", () => {
  beforeEach(() => {
    changeURL("?");
  });

  it("should initially have the correct query params", () => {
    const { result } = mockRenderHook();
    const [queryParams] = result.current;

    expect(queryParams).toStrictEqual({ panel: null, mockParam: "mockValue" });
  });

  it("should replace default values of query params with those from URL", () => {
    changeURL("?panel=mockPanelName");

    const { result } = mockRenderHook();
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
    changeURL(
      "?externalParam=externalValue&panel=mockPanelName&mockParam=mockValue",
    );

    const { result } = mockRenderHook();
    const [, , handleRemovePanelQueryParams] = result.current;

    act(() => handleRemovePanelQueryParams());

    expect(window.location.search).toBe("?externalParam=externalValue");
  });
});
