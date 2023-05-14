import { renderHook } from "@testing-library/react";

import useWindowTitle from "./useWindowTitle";

describe("useWindowTitle", () => {
  it("sets a default window title", () => {
    renderHook(() => useWindowTitle());
    expect(document.title).toBe("Juju Dashboard");
  });

  it("can set the window title", () => {
    renderHook(() => useWindowTitle("Home"));
    expect(document.title).toBe("Home | Juju Dashboard");
  });
});
