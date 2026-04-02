import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Formik } from "formik";

import { renderComponent } from "testing/utils";

import { FieldName } from "../types";
import { versions } from "../utils";

import Fields from "./Fields";
import { Label, TestId } from "./types";

it("can display the recommended fields", async () => {
  renderComponent(
    <Formik
      initialValues={{
        [FieldName.MANUAL_VERSION]: "",
        [FieldName.RECOMMENDED_VERSION]: "",
        [FieldName.UPGRADE_TYPE]: "",
      }}
      onSubmit={vi.fn()}
    >
      <Fields currentVersion="1.2.3" />
    </Formik>,
  );
  expect(screen.queryByTestId(TestId.RECOMMENDED)).not.toBeInTheDocument();
  await userEvent.click(screen.getByRole("radio", { name: Label.RECOMMENDED }));
  expect(screen.getByTestId(TestId.RECOMMENDED)).toBeInTheDocument();
  expect(screen.queryByTestId(TestId.MANUAL)).not.toBeInTheDocument();
});

it("can display the manual fields", async () => {
  renderComponent(
    <Formik
      initialValues={{
        [FieldName.MANUAL_VERSION]: "",
        [FieldName.RECOMMENDED_VERSION]: "",
        [FieldName.UPGRADE_TYPE]: "",
      }}
      onSubmit={vi.fn()}
    >
      <Fields currentVersion="1.2.3" />
    </Formik>,
  );
  expect(screen.queryByTestId(TestId.MANUAL)).not.toBeInTheDocument();
  await userEvent.click(screen.getByRole("radio", { name: Label.MANUAL }));
  expect(screen.getByTestId(TestId.MANUAL)).toBeInTheDocument();
  expect(screen.queryByTestId(TestId.RECOMMENDED)).not.toBeInTheDocument();
});

it("suggests versions", async () => {
  renderComponent(
    <Formik
      initialValues={{
        [FieldName.MANUAL_VERSION]: "",
        [FieldName.RECOMMENDED_VERSION]: "",
        [FieldName.UPGRADE_TYPE]: "",
      }}
      onSubmit={vi.fn()}
    >
      <Fields currentVersion="1.2.3" />
    </Formik>,
  );
  await userEvent.click(screen.getByRole("radio", { name: Label.MANUAL }));
  await userEvent.click(screen.getByRole("textbox", { name: Label.VERSION }));
  versions.forEach(({ version }) => {
    expect(screen.getByRole("option", { name: version })).toBeInTheDocument();
  });
});
