import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Field, Form, Formik } from "formik";

import { renderComponent } from "testing/utils";

import SearchHelp from "./SearchHelp";

describe("SearchHelp", () => {
  it("should update the field and perform a search when clicking a link", async () => {
    const search = jest.fn();
    renderComponent(
      <Formik initialValues={{ query: "" }} onSubmit={jest.fn()}>
        <Form>
          <Field name="query" />
          <SearchHelp search={search} />
        </Form>
      </Formik>,
      { url: "/?q=.applications" }
    );
    // Open the menu so that the portal gets rendered.
    await userEvent.click(screen.getByRole("button", { name: "." }));
    expect(search).toHaveBeenCalledWith(".");
  });
});
