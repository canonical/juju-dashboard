import userEvent from "@testing-library/user-event";
import { vi } from "vitest";

import * as LocalStorage from "hooks/useLocalStorage";
import { renderComponent } from "testing/utils";

import featureFlags from "./feature-flags";

const { Title, Widget } = featureFlags;

describe("Title", () => {
  it.for([
    [0, []],
    [1, ["flag-a"]],
    [3, ["flag-a", "flag-b", "flag-c"]],
  ] as const)("render %s flag(s)", ([amount, flags], { expect }) => {
    vi.spyOn(LocalStorage, "default").mockReturnValue([flags, vi.fn()]);

    const {
      result: { container },
    } = renderComponent(<Title />);

    expect(container).toHaveTextContent("Feature flags");
    expect(container).toHaveTextContent(`${amount} enabled`);
  });
});

describe("Widget", () => {
  it.for([
    [0, []],
    [1, ["flag-a"]],
    [3, ["flag-a", "flag-b", "flag-c"]],
  ] as const)("render %s flag(s)", ([amount, flags], { expect }) => {
    vi.spyOn(LocalStorage, "default").mockReturnValue([flags, vi.fn()]);

    const { result } = renderComponent(<Widget />);

    const inputs = result.queryAllByRole("textbox");

    expect(inputs).toHaveLength(amount);
    for (let i = 0; i < amount; i++) {
      expect(inputs[i]).toHaveValue(flags[i]);
    }
  });

  it("delete flag", async ({ expect }) => {
    const setFlags = vi.fn();
    vi.spyOn(LocalStorage, "default").mockReturnValue([
      ["flag-a", "flag-b"],
      setFlags,
    ]);

    const { result } = renderComponent(<Widget />);

    // Delete button
    await userEvent.click(result.getAllByRole("button", { name: "" })[0]);
    expect(setFlags).not.toHaveBeenCalled();

    // Save changes
    await userEvent.click(result.getByText("Save"));
    expect(setFlags).toHaveBeenCalledExactlyOnceWith(["flag-b"]);
  });

  it("edit flag", async ({ expect }) => {
    const setFlags = vi.fn();
    vi.spyOn(LocalStorage, "default").mockReturnValue([
      ["flag-a", "flag-b", "flag-c"],
      setFlags,
    ]);

    const { result } = renderComponent(<Widget />);

    // Edit new flag
    const inputs = result.getAllByRole("textbox");
    expect(inputs).toHaveLength(3);
    expect(inputs[1]).toHaveValue("flag-b");

    await userEvent.type(inputs[1], "-new");

    // Save changes
    await userEvent.click(result.getByText("Save"));
    expect(setFlags).toHaveBeenCalledExactlyOnceWith([
      "flag-a",
      "flag-b-new",
      "flag-c",
    ]);
  });

  it("add flag", async ({ expect }) => {
    const setFlags = vi.fn();
    vi.spyOn(LocalStorage, "default").mockReturnValue([
      ["flag-a", "flag-b"],
      setFlags,
    ]);

    const { result } = renderComponent(<Widget />);

    // Add button
    await userEvent.click(result.getByRole("button", { name: "Add Flag" }));
    expect(setFlags).not.toHaveBeenCalled();

    // Edit new flag
    const inputs = result.getAllByRole("textbox");
    expect(inputs).toHaveLength(3);
    expect(inputs[2]).toHaveValue("");

    await userEvent.type(inputs[2], "new-flag");

    // Save changes
    await userEvent.click(result.getByText("Save"));
    expect(setFlags).toHaveBeenCalledExactlyOnceWith([
      "flag-a",
      "flag-b",
      "new-flag",
    ]);
  });
});
