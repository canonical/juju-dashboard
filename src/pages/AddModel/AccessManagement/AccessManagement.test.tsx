import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Formik } from "formik";

import { renderComponent } from "testing/utils";

import AccessManagement from "./AccessManagement";

describe("AccessManagement", () => {
  it("shows a footer button when the multiselect has input", async () => {
    renderComponent(
      <Formik initialValues={{ shareModelWith: {} }} onSubmit={vi.fn()}>
        <AccessManagement />
      </Formik>,
    );

    const input = screen.getByRole("combobox", { name: "Add users" });

    expect(
      screen.queryByRole("button", { name: "test@example.com" }),
    ).not.toBeInTheDocument();

    await userEvent.type(input, "test@example.com");

    expect(
      screen.getByRole("button", { name: "test@example.com" }),
    ).toBeInTheDocument();
  });

  it("hides the footer button when the multiselect input is cleared", async () => {
    renderComponent(
      <Formik initialValues={{}} onSubmit={vi.fn()}>
        <AccessManagement />
      </Formik>,
    );

    const input = screen.getByRole("combobox", { name: "Add users" });

    await userEvent.type(input, "test@example.com");
    expect(
      screen.getByRole("button", { name: "test@example.com" }),
    ).toBeInTheDocument();

    await userEvent.clear(input);

    expect(
      screen.queryByRole("button", { name: "test@example.com" }),
    ).not.toBeInTheDocument();
  });

  it("shows no users found when the filter has no matches", async () => {
    renderComponent(
      <Formik initialValues={{ shareModelWith: {} }} onSubmit={vi.fn()}>
        <AccessManagement />
      </Formik>,
    );

    const input = screen.getByRole("combobox", { name: "Add users" });

    expect(screen.queryByText("No users found")).not.toBeInTheDocument();

    await userEvent.type(input, "not-a-user");

    expect(screen.getByText("No users found")).toBeInTheDocument();
  });

  it("adds a typed user when footer add button is clicked", async () => {
    renderComponent(
      <Formik initialValues={{ shareModelWith: {} }} onSubmit={vi.fn()}>
        <AccessManagement />
      </Formik>,
    );

    const input = screen.getByRole("combobox", { name: "Add users" });

    await userEvent.type(input, "newuser@example.com");
    await userEvent.click(
      screen.getByRole("button", { name: "newuser@example.com" }),
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

    const input = screen.getByRole("combobox", { name: "Add users" });

    await userEvent.type(input, "test@example.com");
    await userEvent.click(
      screen.getByRole("button", { name: "test@example.com" }),
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

    const input = screen.getByRole("combobox", { name: "Add users" });

    await userEvent.type(input, "first@example.com");
    await userEvent.click(
      screen.getByRole("button", { name: "first@example.com" }),
    );

    const initialAdminButtons = screen.getAllByRole("button", {
      name: "Admin",
    });
    await userEvent.click(initialAdminButtons[initialAdminButtons.length - 1]);
    await userEvent.click(screen.getByRole("option", { name: "Read" }));
    expect(screen.getByRole("button", { name: "Read" })).toBeInTheDocument();

    await userEvent.type(input, "second@example.com");
    await userEvent.click(
      screen.getByRole("button", { name: "second@example.com" }),
    );

    expect(screen.getByRole("button", { name: "Read" })).toBeInTheDocument();
  });

  it("shows active user in access table with disabled delete button", async () => {
    renderComponent(
      <Formik initialValues={{ shareModelWith: {} }} onSubmit={vi.fn()}>
        <AccessManagement />
      </Formik>,
    );

    expect(screen.getByText(/\(you\)/)).toBeInTheDocument();
    const deleteButtons = screen.getAllByRole("button", { name: "Delete" });
    expect(deleteButtons[0]).toHaveAttribute("aria-disabled", "true");
  });
});
