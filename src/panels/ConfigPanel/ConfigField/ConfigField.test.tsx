import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { vi } from "vitest";

import type { ConfigData } from "../types";

import ConfigField from "./ConfigField";
import { Label } from "./types";

describe("ConfigField", () => {
  const config: ConfigData = {
    name: "name",
    default: "eggman",
    description: "a username",
    source: "default",
    type: "string",
    value: "eggman1",
    newValue: "eggman2",
  };

  it("displays an input", async () => {
    render(
      <ConfigField
        config={config}
        selectedConfig={undefined}
        input={(value: string) => (
          <input type="text" value={value} onChange={vi.fn()} />
        )}
        setSelectedConfig={vi.fn()}
        setNewValue={vi.fn()}
      />,
    );
    expect(screen.getByRole("textbox")).toHaveValue("eggman2");
  });

  it("highlights a field when focused", async () => {
    render(
      <ConfigField
        config={config}
        selectedConfig={config}
        input={(value: string) => (
          <input type="text" value={value} onChange={vi.fn()} />
        )}
        setSelectedConfig={vi.fn()}
        setNewValue={vi.fn()}
      />,
    );
    expect(document.querySelector(".config-input")).toHaveClass(
      "config-input--focused",
    );
  });

  it("highlights a field when changed", async () => {
    render(
      <ConfigField
        config={config}
        selectedConfig={config}
        input={(value: string) => (
          <input type="text" value={value} onChange={vi.fn()} />
        )}
        setSelectedConfig={vi.fn()}
        setNewValue={vi.fn()}
      />,
    );
    expect(document.querySelector(".config-input")).toHaveClass(
      "config-input--changed",
    );
  });

  it("can toggle the description", async () => {
    Object.defineProperty(HTMLElement.prototype, "offsetParent", {
      get() {
        return this.parentNode;
      },
    });
    Object.defineProperty(HTMLElement.prototype, "clientHeight", {
      get() {
        return 20;
      },
    });
    const { rerender } = render(
      <ConfigField
        config={config}
        selectedConfig={config}
        input={(value: string) => (
          <input type="text" value={value} onChange={vi.fn()} />
        )}
        setSelectedConfig={vi.fn()}
        setNewValue={vi.fn()}
      />,
    );
    expect(document.querySelector(".config-input--description")).toHaveStyle({
      maxHeight: "0px",
    });
    await userEvent.click(
      screen.getByRole("button", { name: Label.TOGGLE_DESCRIPTION }),
    );
    rerender(
      <ConfigField
        config={config}
        selectedConfig={config}
        input={(value: string) => (
          <input type="text" value={value} onChange={vi.fn()} />
        )}
        setSelectedConfig={vi.fn()}
        setNewValue={vi.fn()}
      />,
    );
    expect(document.querySelector(".config-input--description")).toHaveStyle({
      maxHeight: "20px",
    });
  });

  it("can reset the value to the default", async () => {
    const setNewValue = vi.fn();
    render(
      <ConfigField
        config={config}
        selectedConfig={undefined}
        input={(value: string) => (
          <input type="text" value={value} onChange={vi.fn()} />
        )}
        setSelectedConfig={vi.fn()}
        setNewValue={setNewValue}
      />,
    );
    await userEvent.click(
      screen.getByRole("button", { name: Label.DEFAULT_BUTTON }),
    );
    expect(setNewValue).toHaveBeenCalledWith("name", "eggman");
  });

  it("displays errors", async () => {
    render(
      <ConfigField
        config={{ ...config, error: "Uh oh!" }}
        selectedConfig={undefined}
        input={(value: string) => (
          <input type="text" value={value} onChange={vi.fn()} />
        )}
        setSelectedConfig={vi.fn()}
        setNewValue={vi.fn()}
        validate={vi.fn()}
      />,
    );
    expect(document.querySelector(".p-form-validation")).toHaveClass(
      "is-error",
    );
    expect(screen.getByText("Uh oh!")).toHaveClass(
      "p-form-validation__message",
    );
  });

  it("calls the validate function when first displayed", async () => {
    const validate = vi.fn();
    render(
      <ConfigField
        config={config}
        selectedConfig={undefined}
        input={(value: string) => (
          <input type="text" value={value} onChange={vi.fn()} />
        )}
        setSelectedConfig={vi.fn()}
        setNewValue={vi.fn()}
        validate={validate}
      />,
    );
    expect(validate).toHaveBeenCalledWith(config);
  });

  it("calls the validate function when the value changes", async () => {
    const validate = vi.fn();
    const { rerender } = render(
      <ConfigField
        config={config}
        selectedConfig={undefined}
        input={(value: string) => (
          <input type="text" value={value} onChange={vi.fn()} />
        )}
        setSelectedConfig={vi.fn()}
        setNewValue={vi.fn()}
        validate={validate}
      />,
    );
    const newConfig = { ...config, newValue: "hi" };
    rerender(
      <ConfigField
        config={newConfig}
        selectedConfig={undefined}
        input={(value: string) => (
          <input type="text" value={value} onChange={vi.fn()} />
        )}
        setSelectedConfig={vi.fn()}
        setNewValue={vi.fn()}
        validate={validate}
      />,
    );
    expect(validate).toHaveBeenCalledWith(newConfig);
  });

  it("does not call the validate function if the value hasn't changed", async () => {
    const validate = vi.fn();
    const { rerender } = render(
      <ConfigField
        config={config}
        selectedConfig={undefined}
        input={(value: string) => (
          <input type="text" value={value} onChange={vi.fn()} />
        )}
        setSelectedConfig={vi.fn()}
        setNewValue={vi.fn()}
        validate={validate}
      />,
    );
    expect(validate).toHaveBeenCalledTimes(1);
    rerender(
      <ConfigField
        config={
          // Pass a new reference
          { ...config }
        }
        selectedConfig={undefined}
        input={(value: string) => (
          <input type="text" value={value} onChange={vi.fn()} />
        )}
        setSelectedConfig={vi.fn()}
        setNewValue={vi.fn()}
        validate={validate}
      />,
    );
    expect(validate).toHaveBeenCalledTimes(1);
  });
});
