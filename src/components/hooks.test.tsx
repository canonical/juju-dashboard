import { renderHook } from "@testing-library/react";

import { rootStateFactory } from "testing/factories";
import { ComponentProviders, changeURL, createStore } from "testing/utils";

import { useEntityDetailsParams } from "./hooks";

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
