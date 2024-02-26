import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import type { ConfigData } from "juju/api";

import BooleanConfig from "./BooleanConfig";

describe("BooleanConfig", () => {
  const config: ConfigData = {
    name: "bool option",
    default: true,
    description: "a boolean option",
    source: "default",
    type: "boolean",
    value: true,
    newValue: true,
  };

  it("displays radio buttons", async () => {
    render(
      <BooleanConfig
        config={config}
        selectedConfig={undefined}
        setSelectedConfig={jest.fn()}
        setNewValue={jest.fn()}
      />,
    );
    expect(screen.getByRole("radio", { name: "true" })).toBeInTheDocument();
    expect(screen.getByRole("radio", { name: "false" })).toBeInTheDocument();
  });

  it("can change the value", async () => {
    const setNewValue = jest.fn();
    render(
      <BooleanConfig
        config={config}
        selectedConfig={undefined}
        setSelectedConfig={jest.fn()}
        setNewValue={setNewValue}
      />,
    );
    await userEvent.click(screen.getByRole("radio", { name: "false" }));
    expect(setNewValue).toHaveBeenCalledWith("bool option", false);
  });
});
