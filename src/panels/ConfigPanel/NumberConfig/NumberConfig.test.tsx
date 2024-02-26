import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import type { ConfigData } from "juju/api";

import NumberConfig from "./NumberConfig";

describe("NumberConfig", () => {
  const config: ConfigData = {
    name: "number option",
    default: 1,
    description: "a number option",
    source: "default",
    type: "int",
    value: 1,
    newValue: 1,
  };

  it("displays a number input", async () => {
    render(
      <NumberConfig
        config={config}
        selectedConfig={undefined}
        setSelectedConfig={jest.fn()}
        setNewValue={jest.fn()}
      />,
    );
    expect(screen.getByRole("spinbutton")).toBeInTheDocument();
  });

  it("can change the value", async () => {
    const setNewValue = jest.fn();
    render(
      <NumberConfig
        config={config}
        selectedConfig={undefined}
        setSelectedConfig={jest.fn()}
        setNewValue={setNewValue}
      />,
    );
    await userEvent.type(screen.getByRole("spinbutton"), "2");
    expect(setNewValue).toHaveBeenCalledWith("number option", "12");
  });
});
