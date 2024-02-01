import { screen } from "@testing-library/react";
import { Formik } from "formik";

import { renderComponent } from "testing/utils";

import Fields from "./Fields";

describe("Fields", () => {
  it("renders", async () => {
    renderComponent(
      <Formik initialValues={{}} onSubmit={jest.fn()}>
        <Fields />
      </Formik>,
    );
    expect(screen.getByRole("textbox", { name: "Label" })).toBeInTheDocument();
  });
});
