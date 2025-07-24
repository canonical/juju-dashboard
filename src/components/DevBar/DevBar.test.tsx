import userEvent from "@testing-library/user-event";
import { vi } from "vitest";

import * as LocalStorage from "hooks/useLocalStorage";
import { rootStateFactory } from "testing/factories";
import { renderComponent } from "testing/utils";
import DevBar from "./DevBar";

describe("DevBar", () => {
  it("renders", () => {
    const { result } = renderComponent(<DevBar />, {
      state: rootStateFactory.build(),
    });

    const bar = result.container.getElementsByClassName("dev-bar")[0];
    expect(bar.children).toHaveLength(1);
  });

  it("renders minimised", () => {
    vi.spyOn(LocalStorage, "default").mockReturnValueOnce([true, vi.fn()]);

    const { result } = renderComponent(<DevBar />, {
      state: rootStateFactory.build(),
    });

    const bar = result.container.getElementsByClassName("dev-bar")[0];
    expect(bar.children).toHaveLength(2);

    expect(bar.children[0].tagName).toEqual("BUTTON");
  });

  it("will minimise", async () => {
    const setMinimised = vi.fn();
    vi.spyOn(LocalStorage, "default").mockReturnValueOnce([
      false,
      setMinimised,
    ]);
    const { result } = renderComponent(<DevBar />, {
      state: rootStateFactory.build(),
    });

    await userEvent.click(result.getByText("Minimise"));

    expect(setMinimised).toHaveBeenCalledExactlyOnceWith(true);
  });

  it("will maximise", async () => {
    const setMinimised = vi.fn();
    vi.spyOn(LocalStorage, "default").mockReturnValueOnce([true, setMinimised]);
    const { result } = renderComponent(<DevBar />, {
      state: rootStateFactory.build(),
    });

    await userEvent.click(result.container.getElementsByTagName("button")[0]!);
    expect(setMinimised).toHaveBeenCalledExactlyOnceWith(false);
  });
});
