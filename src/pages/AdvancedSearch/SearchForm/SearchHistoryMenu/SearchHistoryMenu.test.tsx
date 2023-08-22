import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Field, Form, Formik } from "formik";

import { renderComponent } from "testing/utils";

import SearchHistoryMenu from "./SearchHistoryMenu";
import { Label } from "./SearchHistoryMenu";

describe("SearchHistoryMenu", () => {
  it("should be disabled when there is no history", async () => {
    renderComponent(
      <Formik initialValues={{ query: "" }} onSubmit={jest.fn()}>
        <SearchHistoryMenu queryHistory={[]} setQueryHistory={jest.fn()} />
      </Formik>,
      { url: "/?q=.applications" }
    );
    expect(screen.getByRole("button", { name: Label.HISTORY })).toBeDisabled();
  });

  it("should display the history in the menu", async () => {
    renderComponent(
      <Formik initialValues={{ query: "" }} onSubmit={jest.fn()}>
        <SearchHistoryMenu
          queryHistory={[".applications", ".machines"]}
          setQueryHistory={jest.fn()}
        />
      </Formik>,
      { url: "/?q=.applications" }
    );
    // Open the menu so that the portal gets rendered.
    await userEvent.click(screen.getByRole("button", { name: Label.HISTORY }));
    expect(
      screen.getByRole("button", { name: ".applications" })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: ".machines" })
    ).toBeInTheDocument();
  });

  it("should update the field and query param when clicking an item", async () => {
    renderComponent(
      <Formik initialValues={{ query: "" }} onSubmit={jest.fn()}>
        <Form>
          <Field name="query" />
          <SearchHistoryMenu
            queryHistory={[".applications", ".machines"]}
            setQueryHistory={jest.fn()}
          />
        </Form>
      </Formik>,
      { url: "/?q=.applications" }
    );
    // Open the menu so that the portal gets rendered.
    await userEvent.click(screen.getByRole("button", { name: Label.HISTORY }));
    await userEvent.click(screen.getByRole("button", { name: ".machines" }));
    expect(window.location.search).toBe("?q=.machines");
    expect(screen.getByRole("textbox")).toHaveValue(".machines");
  });

  it("should be able to clear the history", async () => {
    const setQueryHistory = jest.fn();
    renderComponent(
      <Formik initialValues={{ query: "" }} onSubmit={jest.fn()}>
        <SearchHistoryMenu
          queryHistory={[".applications", ".machines"]}
          setQueryHistory={setQueryHistory}
        />
      </Formik>,
      { url: "/?q=.applications" }
    );
    // Open the menu so that the portal gets rendered.
    await userEvent.click(screen.getByRole("button", { name: Label.HISTORY }));
    await userEvent.click(screen.getByRole("button", { name: Label.CLEAR }));
    expect(setQueryHistory).toHaveBeenCalledWith([]);
  });
});
