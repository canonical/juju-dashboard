import { screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Formik } from "formik";

import { ToastCardTestId } from "components/ToastCard";
import {
  authUserInfoFactory,
  configFactory,
  generalStateFactory,
} from "testing/factories/general";
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
      screen.queryByRole("button", { name: /test@example.com/i }),
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

    const readButtons = screen.getAllByRole("button", { name: "Read" });
    expect(readButtons.length).toBeGreaterThan(0);
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

    const readButtons = screen.getAllByRole("button", { name: "Read" });
    await userEvent.click(readButtons[readButtons.length - 1]);
    await userEvent.click(screen.getByRole("option", { name: "Write" }));

    expect(screen.getByRole("button", { name: "Write" })).toBeInTheDocument();
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

    const initialReadButtons = screen.getAllByRole("button", {
      name: "Read",
    });
    await userEvent.click(initialReadButtons[initialReadButtons.length - 1]);
    await userEvent.click(screen.getByRole("option", { name: "Write" }));
    expect(screen.getByRole("button", { name: "Write" })).toBeInTheDocument();

    await userEvent.type(input, "second@example.com");
    await userEvent.click(
      screen.getByRole("button", { name: /second@example.com/i }),
    );

    expect(screen.getByRole("button", { name: "Write" })).toBeInTheDocument();
  });

  it("shows active user in access table with disabled dropdown and remove button", async () => {
    const state = rootStateFactory.build({
      general: generalStateFactory.withConfig().build({
        controllerConnections: {
          "wss://controller.example.com": {
            user: authUserInfoFactory.build({
              identity: "user-eggman@external",
            }),
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

    expect(screen.getByRole("button", { name: "Admin" })).toHaveAttribute(
      "aria-disabled",
      "true",
    );
    const table = await screen.findByRole("table");
    const userNameCell = customWithin(table).getCellByHeader(
      Label.HEADER_USER_NAME,
    );
    expect(userNameCell).toHaveTextContent("eggman@external (you)");
    const deleteButtons = screen.getAllByRole("button", {
      name: Label.BUTTON_DELETE,
    });
    expect(deleteButtons[0]).toHaveAttribute("aria-disabled", "true");
  });

  it("renders properly without an active user", async () => {
    const state = rootStateFactory.build({
      general: generalStateFactory.withConfig().build({
        controllerConnections: null,
      }),
    });
    renderComponent(
      <Formik initialValues={{ shareModelWith: {} }} onSubmit={vi.fn()}>
        <AccessManagement />
      </Formik>,
      { state },
    );

    const input = screen.getByRole("combobox", {
      name: Label.MULTI_SELECT_LABEL,
    });
    await userEvent.type(input, "new@example.com");

    expect(
      screen.getByRole("button", { name: /new@example.com/i }),
    ).toBeInTheDocument();
    expect(screen.queryByText(/\(you\)/)).not.toBeInTheDocument();
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

  it("shows incorrect email format only after an invalid add click for JIMM", async () => {
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

    const input = screen.getByRole("combobox", {
      name: Label.MULTI_SELECT_LABEL,
    });
    await userEvent.type(input, "not-an-email");
    expect(screen.getByText(FormatHint.JIMM)).toBeInTheDocument();

    await userEvent.click(
      screen.getByRole("button", { name: /not-an-email/i }),
    );
    expect(screen.getByText(Label.INCORRECT_EMAIL_FORMAT)).toBeInTheDocument();
  });

  it("restores the JIMM format hint when the user keeps typing after an invalid add click", async () => {
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

    const input = screen.getByRole("combobox", {
      name: Label.MULTI_SELECT_LABEL,
    });

    await userEvent.type(input, "not-an-email");
    await userEvent.click(
      screen.getByRole("button", { name: /not-an-email/i }),
    );
    expect(screen.getByText(Label.INCORRECT_EMAIL_FORMAT)).toBeInTheDocument();

    await userEvent.type(input, "x");
    expect(screen.getByText(FormatHint.JIMM)).toBeInTheDocument();
  });

  it("restores the JIMM format hint when the search is cleared", async () => {
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

    const input = screen.getByRole("combobox", {
      name: Label.MULTI_SELECT_LABEL,
    });

    await userEvent.type(input, "not-an-email");
    await userEvent.click(
      screen.getByRole("button", { name: /not-an-email/i }),
    );
    expect(screen.getByText(Label.INCORRECT_EMAIL_FORMAT)).toBeInTheDocument();

    await userEvent.clear(input);
    await userEvent.click(input);
    expect(screen.getByText(AddUserHint.JIMM)).toBeInTheDocument();
  });

  it("enables active user dropdown when another user has admin access for Juju", async () => {
    const state = rootStateFactory.build({
      general: generalStateFactory.build({
        config: configFactory.build({
          isJuju: true,
        }),
        controllerConnections: {
          "wss://controller.example.com": {
            user: authUserInfoFactory.build(),
          },
        },
      }),
    });
    renderComponent(
      <Formik
        initialValues={{ shareModelWith: { "test@example.com": "admin" } }}
        onSubmit={vi.fn()}
      >
        <AccessManagement />
      </Formik>,
      { state },
    );

    // Active user's dropdown should be enabled since test@example.com is admin
    const adminButtons = screen.getAllByRole("button", { name: "Admin" });
    expect(adminButtons[0]).not.toHaveAttribute("aria-disabled", "true");
  });

  it("enables the active user dropdown when another user has admin access for JIMM", async () => {
    const state = rootStateFactory.build({
      general: generalStateFactory.build({
        config: configFactory.build({
          isJuju: false,
        }),
        controllerConnections: {
          "wss://controller.example.com": {
            user: authUserInfoFactory.build(),
          },
        },
      }),
    });
    renderComponent(
      <Formik
        initialValues={{ shareModelWith: { "test@example.com": "admin" } }}
        onSubmit={vi.fn()}
      >
        <AccessManagement />
      </Formik>,
      { state },
    );

    const adminButtons = screen.getAllByRole("button", { name: "Admin" });
    expect(adminButtons[0]).not.toHaveAttribute("aria-disabled", "true");
  });

  it("returns the active user's permission to 'admin' if all other admins are removed", async () => {
    const state = rootStateFactory.build({
      general: generalStateFactory.build({
        config: configFactory.build({
          isJuju: true,
        }),
        controllerConnections: {
          "wss://controller.example.com": {
            user: authUserInfoFactory.build(),
          },
        },
      }),
    });
    renderComponent(
      <Formik
        initialValues={{ shareModelWith: { "test@example.com": "admin" } }}
        onSubmit={vi.fn()}
      >
        <AccessManagement />
      </Formik>,
      { state },
    );
    const table = screen.getByRole("table");
    const rows = within(table).getAllByRole("row");
    const activeUserButton = within(rows[1]).getByRole("button", {
      name: "Admin",
    });
    // Change the active user's permission
    await userEvent.click(activeUserButton);
    await userEvent.click(screen.getByRole("option", { name: "Read" }));
    expect(activeUserButton).toHaveTextContent("Read");
    await userEvent.click(
      within(rows[2]).getByRole("button", {
        name: Label.BUTTON_DELETE,
      }),
    );

    const updatedRows = within(table).getAllByRole("row");
    const updatedActiveUserButton = within(updatedRows[1]).getByRole("button", {
      name: "Admin",
    });

    expect(updatedActiveUserButton).toHaveAttribute("aria-disabled", "true");
    expect(updatedActiveUserButton).toHaveTextContent("Admin");

    const card = await screen.findByTestId(ToastCardTestId.TOAST_CARD);
    expect(card).toHaveAttribute("data-type", "caution");
    expect(
      await within(card).findByText("Admin access set for eggman@external"),
    ).toBeInTheDocument();
  });

  it("restores active user to admin when the only admin is removed and readers remain", async () => {
    const state = rootStateFactory.build({
      general: generalStateFactory.build({
        config: configFactory.build({
          isJuju: true,
        }),
        controllerConnections: {
          "wss://controller.example.com": {
            user: authUserInfoFactory.build(),
          },
        },
      }),
    });

    renderComponent(
      <Formik
        initialValues={{
          shareModelWith: {
            "test@example.com": "admin",
            "reader@example.com": "read",
          },
        }}
        onSubmit={vi.fn()}
      >
        <AccessManagement />
      </Formik>,
      { state },
    );

    const table = screen.getByRole("table");
    const rows = within(table).getAllByRole("row");
    const activeUserAccessCell = customWithin(rows[1]).getCellByHeader(
      Label.HEADER_ACCESS_LEVEL,
    );
    const activeUserButton = within(activeUserAccessCell).getByRole("button", {
      name: "Admin",
    });

    await userEvent.click(activeUserButton);
    await userEvent.click(screen.getByRole("option", { name: "Read" }));

    await userEvent.click(
      within(rows[2]).getByRole("button", {
        name: Label.BUTTON_DELETE,
      }),
    );

    const updatedRows = within(table).getAllByRole("row");
    const updatedActiveUserAccessCell = customWithin(
      updatedRows[1],
    ).getCellByHeader(Label.HEADER_ACCESS_LEVEL);
    const updatedActiveUserButton = within(
      updatedActiveUserAccessCell,
    ).getByRole("button", {
      name: "Admin",
    });

    expect(updatedActiveUserButton).toHaveTextContent("Admin");
    expect(updatedActiveUserButton).toHaveAttribute("aria-disabled", "true");
  });

  it("disables the other admin after active user is demoted", async () => {
    const state = rootStateFactory.build({
      general: generalStateFactory.build({
        config: configFactory.build({
          isJuju: true,
        }),
        controllerConnections: {
          "wss://controller.example.com": {
            user: authUserInfoFactory.build(),
          },
        },
      }),
    });

    renderComponent(
      <Formik
        initialValues={{ shareModelWith: { "test@example.com": "admin" } }}
        onSubmit={vi.fn()}
      >
        <AccessManagement />
      </Formik>,
      { state },
    );

    const table = screen.getByRole("table");
    const rows = within(table).getAllByRole("row");
    const activeUserAdminButton = within(rows[1]).getByRole("button", {
      name: "Admin",
    });

    await userEvent.click(activeUserAdminButton);
    await userEvent.click(screen.getByRole("option", { name: "Read" }));

    const updatedRows = within(table).getAllByRole("row");
    const otherAdminButton = within(updatedRows[2]).getByRole("button", {
      name: "Admin",
    });
    expect(otherAdminButton).toHaveAttribute("aria-disabled", "true");
  });
});
