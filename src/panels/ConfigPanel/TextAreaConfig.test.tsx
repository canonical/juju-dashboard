import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import type { ConfigData } from "juju/api";

import TextAreaConfig from "./TextAreaConfig";

describe("TextAreaConfig", () => {
  const config: ConfigData = {
    name: "text option",
    default: "word",
    description: "a text option",
    source: "default",
    type: "string",
    value: "word",
    newValue: "word",
  };

  it("displays a number input", async () => {
    render(
      <TextAreaConfig
        config={config}
        selectedConfig={undefined}
        setSelectedConfig={jest.fn()}
        setNewValue={jest.fn()}
      />
    );
    expect(screen.getByRole("textbox")).toBeInTheDocument();
  });

  it("can change the value", async () => {
    const setNewValue = jest.fn();
    render(
      <TextAreaConfig
        config={config}
        selectedConfig={undefined}
        setSelectedConfig={jest.fn()}
        setNewValue={setNewValue}
      />
    );
    await userEvent.type(screen.getByRole("textbox"), "!");
    expect(setNewValue).toHaveBeenCalledWith("text option", "word!");
  });
});
