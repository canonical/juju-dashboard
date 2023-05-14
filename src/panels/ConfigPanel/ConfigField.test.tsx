import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import type { ConfigData } from "juju/api";

import ConfigField, { Label } from "./ConfigField";

describe("ConfigField", () => {
  const config: ConfigData = {
    name: "name",
    default: "eggman",
    description: "a username",
    source: "default",
    type: "string",
    value: "eggmant1",
    newValue: "eggman2",
  };

  it("displays an input", async () => {
    render(
      <ConfigField
        config={config}
        selectedConfig={undefined}
        input={(value: string) => (
          <input type="text" value={value} onChange={jest.fn()} />
        )}
        setSelectedConfig={jest.fn()}
        setNewValue={jest.fn()}
      />
    );
    expect(screen.getByRole("textbox")).toHaveValue("eggman2");
  });

  it("highlights a field when focused", async () => {
    render(
      <ConfigField
        config={config}
        selectedConfig={config}
        input={(value: string) => (
          <input type="text" value={value} onChange={jest.fn()} />
        )}
        setSelectedConfig={jest.fn()}
        setNewValue={jest.fn()}
      />
    );
    expect(document.querySelector(".config-input")).toHaveClass(
      "config-input--focused"
    );
  });

  it("highlights a field when changed", async () => {
    render(
      <ConfigField
        config={config}
        selectedConfig={config}
        input={(value: string) => (
          <input type="text" value={value} onChange={jest.fn()} />
        )}
        setSelectedConfig={jest.fn()}
        setNewValue={jest.fn()}
      />
    );
    expect(document.querySelector(".config-input")).toHaveClass(
      "config-input--changed"
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
          <input type="text" value={value} onChange={jest.fn()} />
        )}
        setSelectedConfig={jest.fn()}
        setNewValue={jest.fn()}
      />
    );
    expect(document.querySelector(".config-input--description")).toHaveStyle({
      maxHeight: "0px",
    });
    await userEvent.click(
      screen.getByRole("button", { name: Label.TOGGLE_DESCRIPTION })
    );
    rerender(
      <ConfigField
        config={config}
        selectedConfig={config}
        input={(value: string) => (
          <input type="text" value={value} onChange={jest.fn()} />
        )}
        setSelectedConfig={jest.fn()}
        setNewValue={jest.fn()}
      />
    );
    expect(document.querySelector(".config-input--description")).toHaveStyle({
      maxHeight: "20px",
    });
  });

  it("can reset the value to the default", async () => {
    const setNewValue = jest.fn();
    render(
      <ConfigField
        config={config}
        selectedConfig={undefined}
        input={(value: string) => (
          <input type="text" value={value} onChange={jest.fn()} />
        )}
        setSelectedConfig={jest.fn()}
        setNewValue={setNewValue}
      />
    );
    await userEvent.click(
      screen.getByRole("button", { name: Label.DEFAULT_BUTTON })
    );
    expect(setNewValue).toHaveBeenCalledWith("name", "eggman");
  });
});
