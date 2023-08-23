import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Field, Form, Formik } from "formik";

import { jujuStateFactory, rootStateFactory } from "testing/factories";
import { crossModelQueryStateFactory } from "testing/factories/juju/juju";
import { renderComponent } from "testing/utils";

import SearchHistoryMenu from "./SearchHistoryMenu";
import { Label } from "./SearchHistoryMenu";

describe("SearchHistoryMenu", () => {
  it("should be disabled when there is no history", async () => {
    renderComponent(
      <Formik initialValues={{ query: "" }} onSubmit={jest.fn()}>
        <SearchHistoryMenu
          queryHistory={[]}
          search={jest.fn()}
          setQueryHistory={jest.fn()}
        />
      </Formik>,
      { url: "/?q=.applications" }
    );
    expect(screen.getByRole("button", { name: Label.HISTORY })).toBeDisabled();
  });

  it("should disable the items while loading", async () => {
    const state = rootStateFactory.build({
      juju: jujuStateFactory.build({
        crossModelQuery: crossModelQueryStateFactory.build({
          loading: true,
        }),
      }),
    });
    renderComponent(
      <Formik initialValues={{ query: "" }} onSubmit={jest.fn()}>
        <SearchHistoryMenu
          queryHistory={[".applications"]}
          search={jest.fn()}
          setQueryHistory={jest.fn()}
        />
      </Formik>,
      { state, url: "/?q=.applications" }
    );
    // Open the menu so that the portal gets rendered.
    await userEvent.click(screen.getByRole("button", { name: Label.HISTORY }));
    expect(
      screen.getByRole("button", { name: ".applications" })
    ).toBeDisabled();
  });

  it("should display the history in the menu", async () => {
    renderComponent(
      <Formik initialValues={{ query: "" }} onSubmit={jest.fn()}>
        <SearchHistoryMenu
          queryHistory={[".applications", ".machines"]}
          search={jest.fn()}
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

  it("should update the field and perform a search when clicking an item", async () => {
    const search = jest.fn();
    renderComponent(
      <Formik initialValues={{ query: "" }} onSubmit={jest.fn()}>
        <Form>
          <Field name="query" />
          <SearchHistoryMenu
            queryHistory={[".applications", ".machines"]}
            search={search}
            setQueryHistory={jest.fn()}
          />
        </Form>
      </Formik>,
      { url: "/?q=.applications" }
    );
    // Open the menu so that the portal gets rendered.
    await userEvent.click(screen.getByRole("button", { name: Label.HISTORY }));
    await userEvent.click(screen.getByRole("button", { name: ".machines" }));
    expect(search).toHaveBeenCalledWith(".machines");
    expect(screen.getByRole("textbox")).toHaveValue(".machines");
  });

  it("should be able to clear the history", async () => {
    const setQueryHistory = jest.fn();
    renderComponent(
      <Formik initialValues={{ query: "" }} onSubmit={jest.fn()}>
        <SearchHistoryMenu
          queryHistory={[".applications", ".machines"]}
          search={jest.fn()}
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
