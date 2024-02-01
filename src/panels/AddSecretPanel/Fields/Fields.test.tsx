import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Formik } from "formik";

import { renderComponent } from "testing/utils";

import Fields, { Label } from "./Fields";

describe("Fields", () => {
  it("displays key/value pairs", async () => {
    renderComponent(
      <Formik
        initialValues={{ pairs: [{ key: "", value: "", isBase64: false }] }}
        onSubmit={jest.fn()}
      >
        <Fields />
      </Formik>,
    );
    expect(
      screen.getByRole("textbox", { name: `${Label.KEY} 1` }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("textbox", { name: `${Label.VALUE} 1` }),
    ).toBeInTheDocument();
  });

  it("allows you to add pairs", async () => {
    renderComponent(
      <Formik
        initialValues={{ pairs: [{ key: "", value: "", isBase64: false }] }}
        onSubmit={jest.fn()}
      >
        <Fields />
      </Formik>,
    );
    expect(
      screen.queryByRole("textbox", { name: `${Label.KEY} 2` }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("textbox", { name: `${Label.VALUE} 2` }),
    ).not.toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: Label.ADD }));
    expect(
      screen.getByRole("textbox", { name: `${Label.KEY} 2` }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("textbox", { name: `${Label.VALUE} 2` }),
    ).toBeInTheDocument();
  });

  it("does not allow you to remove the first pair", async () => {
    renderComponent(
      <Formik
        initialValues={{ pairs: [{ key: "", value: "", isBase64: false }] }}
        onSubmit={jest.fn()}
      >
        <Fields />
      </Formik>,
    );
    expect(screen.getByRole("button", { name: Label.REMOVE })).toBeDisabled();
  });

  it("allows you to remove pairs if there are more than one", async () => {
    renderComponent(
      <Formik
        initialValues={{ pairs: [{ key: "", value: "", isBase64: false }] }}
        onSubmit={jest.fn()}
      >
        <Fields />
      </Formik>,
    );
    await userEvent.click(screen.getByRole("button", { name: Label.ADD }));
    const removeButtons = screen.getAllByRole("button", { name: Label.REMOVE });
    expect(removeButtons[0]).not.toBeDisabled();
    expect(removeButtons[1]).not.toBeDisabled();
  });
});
