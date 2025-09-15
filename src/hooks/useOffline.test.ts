import { renderHook, fireEvent } from "@testing-library/react";

import useOffline from "./useOffline";

describe("useOffline", () => {
  it("detects if it is online", () => {
    const { result } = renderHook(() => useOffline());
    fireEvent.online(window);
    expect(result.current).toBe(false);
  });

  it("detects if it is offline", () => {
    const { result } = renderHook(() => useOffline());
    fireEvent.offline(window);
    expect(result.current).toBe(true);
  });

  it("cleans up", () => {
    const { result, unmount } = renderHook(() => useOffline());
    unmount();
    fireEvent.offline(window);
    expect(result.current).toBeNull();
  });
});
