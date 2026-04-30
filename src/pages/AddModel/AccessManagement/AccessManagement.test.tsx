import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Formik } from "formik";

import { configFactory, generalStateFactory } from "testing/factories/general";
import { rootStateFactory } from "testing/factories/root";
import { customWithin } from "testing/queries/within";
import { renderComponent } from "testing/utils";

import AccessManagement from "./AccessManagement";
import { AddUserHint, FormatHint, Label } from "./types";

describe("AccessManagement", () => {
  it("shows a footer button when the multiselect has input", async () => {
    renderComponent(
      <Formik initialValues={{ shareModelWith: {} }} onSubmit={vi.fn()}>
        <AccessManagement />
      </Formik>,
    );

    const input = screen.getByRole("combobox", {
      name: Label.MULTI_SELECT_LABEL,
    });
    expect(
      screen.queryByRole("button", { name: "test@example.com" }),
    ).not.toBeInTheDocument();

    await userEvent.type(input, "test@example.com");
    expect(
      screen.getByRole("button", { name: /test@example.com/i }),
    ).toBeInTheDocument();
  });

  it("hides the footer button when the multiselect input is cleared", async () => {
    renderComponent(
      <Formik initialValues={{}} onSubmit={vi.fn()}>
        <AccessManagement />
      </Formik>,
    );

    const input = screen.getByRole("combobox", {
      name: Label.MULTI_SELECT_LABEL,
    });
    await userEvent.type(input, "test@example.com");
    expect(
      screen.getByRole("button", { name: /test@example.com/i }),
    ).toBeInTheDocument();

    await userEvent.clear(input);
    expect(
      screen.queryByRole("button", { name: /test@example.com/i }),
    ).not.toBeInTheDocument();
  });

  it("shows no users found when the filter has no matches", async () => {
    renderComponent(
      <Formik initialValues={{ shareModelWith: {} }} onSubmit={vi.fn()}>
        <AccessManagement />
      </Formik>,
    );

    const input = screen.getByRole("combobox", {
      name: Label.MULTI_SELECT_LABEL,
    });
    expect(
      screen.queryByText(Label.MULTI_SELECT_NO_USERS),
    ).not.toBeInTheDocument();

    await userEvent.type(input, "not-a-user");
    expect(screen.getByText(Label.MULTI_SELECT_NO_USERS)).toBeInTheDocument();
  });

  it("adds a typed user when footer add button is clicked", async () => {
    renderComponent(
      <Formik initialValues={{ shareModelWith: {} }} onSubmit={vi.fn()}>
        <AccessManagement />
      </Formik>,
    );

    const input = screen.getByRole("combobox", {
      name: Label.MULTI_SELECT_LABEL,
    });

    await userEvent.type(input, "newuser@example.com");
    await userEvent.click(
      screen.getByRole("button", { name: /newuser@example.com/i }),
    );

    const adminButtons = screen.getAllByRole("button", { name: "Admin" });
    expect(adminButtons.length).toBeGreaterThan(0);
  });

  it("updates access level when changed from custom select", async () => {
    renderComponent(
      <Formik initialValues={{ shareModelWith: {} }} onSubmit={vi.fn()}>
        <AccessManagement />
      </Formik>,
    );

    const input = screen.getByRole("combobox", {
      name: Label.MULTI_SELECT_LABEL,
    });

    await userEvent.type(input, "test@example.com");
    await userEvent.click(
      screen.getByRole("button", { name: /test@example.com/i }),
    );

    const adminButtons = screen.getAllByRole("button", { name: "Admin" });
    await userEvent.click(adminButtons[adminButtons.length - 1]);
    await userEvent.click(screen.getByRole("option", { name: "Read" }));

    expect(screen.getByRole("button", { name: "Read" })).toBeInTheDocument();
  });

  it("keeps changed access levels when adding another user", async () => {
    renderComponent(
      <Formik initialValues={{ shareModelWith: {} }} onSubmit={vi.fn()}>
        <AccessManagement />
      </Formik>,
    );

    const input = screen.getByRole("combobox", {
      name: Label.MULTI_SELECT_LABEL,
    });

    await userEvent.type(input, "first@example.com");
    await userEvent.click(
      screen.getByRole("button", { name: /first@example.com/i }),
    );

    const initialAdminButtons = screen.getAllByRole("button", {
      name: "Admin",
    });
    await userEvent.click(initialAdminButtons[initialAdminButtons.length - 1]);
    await userEvent.click(screen.getByRole("option", { name: "Read" }));
    expect(screen.getByRole("button", { name: "Read" })).toBeInTheDocument();

    await userEvent.type(input, "second@example.com");
    await userEvent.click(
      screen.getByRole("button", { name: /second@example.com/i }),
    );

    expect(screen.getByRole("button", { name: "Read" })).toBeInTheDocument();
  });

  it("shows active user in access table with disabled delete button", async () => {
    const state = rootStateFactory.build({
      general: generalStateFactory.withConfig().build({
        controllerConnections: {
          "wss://controller.example.com": {
            user: {
              "display-name": "eggman",
              identity: "user-eggman@external",
            },
          },
        },
      }),
    });
    renderComponent(
      <Formik initialValues={{ shareModelWith: {} }} onSubmit={vi.fn()}>
        <AccessManagement />
      </Formik>,
      { state },
    );

    const table = await screen.findByRole("table");
    const userNameCell = customWithin(table).getCellByHeader("User Name");
    expect(userNameCell).toHaveTextContent("eggman@external (you)");
    const deleteButtons = screen.getAllByRole("button", { name: "Delete" });
    expect(deleteButtons[0]).toHaveAttribute("aria-disabled", "true");
  });

  it("shows correct prompts for non-Juju scenarios", async () => {
    const state = rootStateFactory.build({
      general: generalStateFactory.build({
        config: configFactory.build({ isJuju: false }),
      }),
    });
    renderComponent(
      <Formik initialValues={{ shareModelWith: {} }} onSubmit={vi.fn()}>
        <AccessManagement />
      </Formik>,
      { state },
    );

    await userEvent.click(
      screen.getByRole("combobox", { name: Label.MULTI_SELECT_LABEL }),
    );
    expect(screen.getByText(AddUserHint.JIMM)).toBeInTheDocument();

    await userEvent.type(
      screen.getByRole("combobox", { name: Label.MULTI_SELECT_LABEL }),
      "new@example.com",
    );
    expect(screen.getByText(FormatHint.JIMM)).toBeInTheDocument();
  });
});
