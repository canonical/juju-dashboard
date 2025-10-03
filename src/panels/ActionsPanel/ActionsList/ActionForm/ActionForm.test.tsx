import userEvent from "@testing-library/user-event";
import { act, createRef } from "react";

import { renderComponent } from "testing/utils";

import ActionForm from "./ActionForm";
import type { FormRef } from "./types";
import { TestId } from "./types";

describe("ActionForm", () => {
  it("handles no properties", async ({ expect }) => {
    const { result } = await act(() =>
      renderComponent(<ActionForm properties={[]} />),
    );
    expect(result.getByTestId(TestId.ActionForm)).toBeDefined();
  });

  it.for([
    ["single field", [{ name: "some-field", type: "text" }]],
    [
      "many fields",
      [
        { name: "field-a", type: "text" },
        { name: "field-b", type: "text" },
        { name: "field-c", type: "checkbox" },
      ],
    ],
  ] as const)(
    "generates initial values (%s)",
    async ([_, fields], { expect }) => {
      const properties = fields.map((field) => ({
        description: "Very cool field.",
        required: false,
        ...field,
      }));

      const ref = createRef<FormRef>();
      const { result } = await act(() =>
        renderComponent(<ActionForm properties={properties} formRef={ref} />),
      );

      // One assertion for each field, plus validating `initialValues`.
      expect.assertions(fields.length + 1);

      for (const { name } of fields) {
        expect(result.getByLabelText(name)).toHaveValue("");
      }

      expect(ref.current?.initialValues).toStrictEqual(
        Object.fromEntries(fields.map(({ name }) => [name, ""])),
      );
    },
  );

  it("waits for required fields", async ({ expect }) => {
    const properties = [
      {
        name: "field-a",
        description: "Field A",
        required: true,
        type: "text",
      },
      {
        name: "field-b",
        description: "Field B",
        required: false,
        type: "text",
      },
    ];
    const formRef = createRef<FormRef>();
    const onSubmit = vi.fn();

    const { result } = renderComponent(
      <ActionForm
        properties={properties}
        onSubmit={onSubmit}
        formRef={formRef}
      />,
    );

    // Try submit the form with nothing filled in.
    await act(async () => formRef.current?.submitForm());
    expect(result.getByText("field-a is a required field")).toBeVisible();
    expect(onSubmit).not.toHaveBeenCalled();

    // Fill in the non-required field and try submit.
    await userEvent.click(result.getByLabelText("field-b"));
    await userEvent.keyboard("some value");
    await act(async () => formRef.current?.submitForm());
    expect(result.getByText("field-a is a required field")).toBeVisible();
    expect(onSubmit).not.toHaveBeenCalled();

    // Fill in the required field and submit.
    await userEvent.click(result.getByLabelText("field-a"));
    await userEvent.keyboard("required value");
    await act(async () => formRef.current?.submitForm());
    expect(result.queryByText("field-a is a required field")).toBeNull();
    expect(onSubmit).toHaveBeenCalledExactlyOnceWith({
      "field-a": "required value",
      "field-b": "some value",
    });
  });

  describe("validation changes", () => {
    const properties = [
      {
        name: "field-a",
        description: "Field A",
        required: true,
        type: "text",
      },
      {
        name: "field-b",
        description: "Field B",
        required: false,
        type: "text",
      },
    ];

    it("required field first", async ({ expect }) => {
      const onValidate = vi.fn();

      const { result } = renderComponent(
        <ActionForm properties={properties} onValidate={onValidate} />,
      );

      // No initial validation state.
      expect(onValidate).not.toHaveBeenCalled();

      await userEvent.click(result.getByLabelText("field-a"));
      await userEvent.keyboard("some text");
      await userEvent.click(result.getByLabelText("field-b"));

      expect(onValidate).toHaveBeenLastCalledWith(true);
    });

    it("non-required field first", async ({ expect }) => {
      const onValidate = vi.fn();

      const { result } = renderComponent(
        <ActionForm properties={properties} onValidate={onValidate} />,
      );

      // No initial validation state.
      expect(onValidate).not.toHaveBeenCalled();

      // Fill out non-required field, and focus on next field.
      await userEvent.click(result.getByLabelText("field-b"));
      await userEvent.keyboard("some text");
      await userEvent.click(result.getByLabelText("field-a"));
      expect(onValidate).toHaveBeenLastCalledWith(false);

      // Fill out required field.
      await userEvent.keyboard("some text");
      expect(onValidate).toHaveBeenLastCalledWith(true);
    });

    it("clear required field", async ({ expect }) => {
      const onValidate = vi.fn();

      const { result } = renderComponent(
        <ActionForm properties={properties} onValidate={onValidate} />,
      );

      // Fill out non-required field, and focus on next field.
      await userEvent.click(result.getByLabelText("field-a"));
      await userEvent.keyboard("some text");
      await userEvent.click(result.getByLabelText("field-b"));
      expect(onValidate).toHaveBeenLastCalledWith(true);

      // Clear required field.
      await userEvent.clear(result.getByLabelText("field-a"));
      expect(onValidate).toHaveBeenLastCalledWith(false);
    });
  });

  describe("enter navigation", () => {
    it.for([
      ["single", ["a"]],
      ["multiple", ["a", "b", "c"]],
    ] as const)(
      "navigate and submit text field (%s)",
      async ([_, fields], { expect }) => {
        const properties = fields.map((field) => ({
          name: field,
          type: "text",
          description: "some field",
          required: false,
        }));

        const onSubmit = vi.fn();

        const { result } = renderComponent(
          <ActionForm properties={properties} onSubmit={onSubmit} />,
        );

        // One assertion for each field, plus a final assertion for `onSubmit`.
        expect.assertions(fields.length + 1);

        // Focus on the first input.
        await userEvent.click(result.getAllByRole("textbox")[0]);

        for (const field of fields) {
          const el = result.getByLabelText(field);
          expect(el).toHaveFocus();
          await userEvent.keyboard(`something ${field}{Enter}`);
        }

        expect(onSubmit).toHaveBeenCalledExactlyOnceWith(
          Object.fromEntries(
            fields.map((field) => [field, `something ${field}`]),
          ),
        );
      },
    );

    it("ignore checkbox", async ({ expect }) => {
      const properties = [
        {
          name: "field-a",
          type: "boolean",
          description: "some field",
          required: false,
        },
        {
          name: "field-b",
          type: "text",
          description: "some field",
          required: false,
        },
      ];

      const onSubmit = vi.fn();

      const { result } = renderComponent(
        <ActionForm properties={properties} onSubmit={onSubmit} />,
      );

      expect.assertions(2);

      // Find and click the checkbox
      const checkbox = result.getByRole("checkbox");
      await userEvent.click(checkbox);

      // Should be ignored
      await userEvent.keyboard("{Enter}");

      expect(checkbox).toHaveFocus();
      expect(onSubmit).not.toHaveBeenCalled();
    });
  });
});
