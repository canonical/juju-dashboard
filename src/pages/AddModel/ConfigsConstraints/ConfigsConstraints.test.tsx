import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Formik } from "formik";

import { renderComponent } from "testing/utils";
import { externalURLs } from "urls";

import ConfigsConstraints from "./ConfigsConstraints";
import { DisableType, Label } from "./types";

describe("ConfigsConstraints", () => {
  it("renders disabled command options with 'none' selected by default", () => {
    renderComponent(
      <Formik
        initialValues={{ disabledCommands: DisableType.NONE }}
        onSubmit={vi.fn()}
      >
        <ConfigsConstraints />
      </Formik>,
    );

    expect(
      screen.getByRole("heading", { name: Label.DISABLED_COMMANDS }),
    ).toBeInTheDocument();
    const docsLink = screen.getByRole("link", {
      name: Label.DISABLE_COMMANDS_DOCS,
    });
    expect(docsLink).toHaveAttribute("href", externalURLs.disableCommand);

    expect(screen.getByRole("radio", { name: "None" })).toBeChecked();
    expect(
      screen.getByRole("radio", { name: Label.DISABLE_DESTROY_MODEL }),
    ).not.toBeChecked();
    expect(
      screen.getByRole("radio", { name: Label.DISABLE_REMOVE_OBJECT }),
    ).not.toBeChecked();
    expect(
      screen.getByRole("radio", { name: Label.DISABLE_ALL_COMMANDS }),
    ).not.toBeChecked();
  });

  it("allows selecting a different option", async () => {
    renderComponent(
      <Formik
        initialValues={{ disabledCommands: DisableType.NONE }}
        onSubmit={vi.fn()}
      >
        <ConfigsConstraints />
      </Formik>,
    );

    await userEvent.click(
      screen.getByRole("radio", { name: Label.DISABLE_ALL_COMMANDS }),
    );

    expect(
      screen.getByRole("radio", { name: Label.DISABLE_ALL_COMMANDS }),
    ).toBeChecked();
  });
});
