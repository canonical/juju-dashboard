import userEvent from "@testing-library/user-event";
import { act, createRef } from "react";

import { renderComponent } from "testing/utils";

import ActionsList from "./ActionsList";
import type { FormControlRef } from "./types";

const actions = {
  required: {
    description: "everything required",
    params: {
      properties: {
        "required-a": {
          description: "Field A",
          type: "text",
        },
        "required-b": {
          description: "Field B",
          type: "text",
        },
      },
      required: ["required-a", "required-b"],
    },
  },
  partial: {
    description: "another action",
    params: {
      properties: {
        "partial-a": {
          description: "required field",
          type: "text",
        },
        "partial-b": {
          description: "optional field",
          type: "text",
        },
      },
      required: ["required"],
    },
  },
  optional: {
    description: "nothing required",
    params: {
      properties: {
        "optional-a": {
          description: "optional field a",
          type: "text",
        },
        "optional-b": {
          description: "optional field b",
          type: "text",
        },
      },
      required: [],
    },
  },
};

describe("ActionsList", () => {
  it("switch between different forms", async ({ expect }) => {
    const formControlRef = createRef<FormControlRef>();
    const { result } = renderComponent(
      <ActionsList actions={actions} formControlRef={formControlRef} />,
    );

    // Focus on the first action.
    await userEvent.click(result.getByLabelText("required"));

    // Ensure the form ref corresponds with the correct form.
    expect(formControlRef.current?.values).toStrictEqual({
      "required-a": "",
      "required-b": "",
    });

    // Ensure the fields are visible.
    expect(result.getByLabelText("required-a")).toBeVisible();
    expect(result.getByLabelText("required-b")).toBeVisible();

    // Ensure other field is not visible.
    expect(result.getByLabelText("partial-a")).not.toBeVisible();

    // Test other action.
    await userEvent.click(result.getByLabelText("partial"));
    expect(formControlRef.current?.values).toStrictEqual({
      "partial-a": "",
      "partial-b": "",
    });
    expect(result.getByLabelText("required-a")).not.toBeVisible();
    expect(result.getByLabelText("required-b")).not.toBeVisible();
    expect(result.getByLabelText("partial-a")).toBeVisible();
  });

  it("submit forms", async ({ expect }) => {
    const onSubmit = vi.fn();
    const formControlRef = createRef<FormControlRef>();
    const { result } = renderComponent(
      <ActionsList
        actions={actions}
        onSubmit={onSubmit}
        formControlRef={formControlRef}
      />,
    );

    // Navigate to the action.
    await userEvent.click(result.getByLabelText("required"));

    // Focus the first form, fill in the fields, and submit with Enter.
    await userEvent.click(result.getByLabelText("required-a"));
    await userEvent.keyboard("field value{Enter}");
    await userEvent.keyboard("another value{Enter}");

    expect(onSubmit).toHaveBeenCalledExactlyOnceWith("required", {
      "required-a": "field value",
      "required-b": "another value",
    });

    // Clear mock to re-run the test.
    onSubmit.mockClear();

    // Navigate to the other action, and fill it in.
    await userEvent.click(result.getByLabelText("partial"));
    await userEvent.click(result.getByLabelText("partial-a"));
    await userEvent.keyboard("data{Enter}");
    await userEvent.keyboard("more data{Enter}");

    // Ensure the form is submitted with the correct fields.
    expect(onSubmit).toHaveBeenCalledExactlyOnceWith("partial", {
      "partial-a": "data",
      "partial-b": "more data",
    });
  });

  it("submit via ref", async ({ expect }) => {
    const onSubmit = vi.fn();
    const formControlRef = createRef<FormControlRef>();

    const { result } = renderComponent(
      <ActionsList
        actions={actions}
        formControlRef={formControlRef}
        onSubmit={onSubmit}
      />,
    );

    await userEvent.click(result.getByLabelText("required"));
    await userEvent.click(result.getByLabelText("required-a"));
    await userEvent.keyboard("a{Enter}");
    await userEvent.keyboard("b");
    await act(async () => formControlRef.current?.submitForm());
    expect(onSubmit).toHaveBeenCalledExactlyOnceWith("required", {
      "required-a": "a",
      "required-b": "b",
    });
  });

  it("prevents submit abuse", async ({ expect }) => {
    const onSubmit = vi.fn();
    const formControlRef = createRef<FormControlRef>();

    const { result } = renderComponent(
      <ActionsList
        actions={actions}
        formControlRef={formControlRef}
        onSubmit={onSubmit}
      />,
    );

    // Select first action, and capture the reference to the form.
    await userEvent.click(result.getByLabelText("optional"));
    const formA = formControlRef.current;

    // Select to the second action.
    await userEvent.click(result.getByLabelText("partial"));
    await userEvent.click(result.getByLabelText("partial-a"));
    await userEvent.keyboard("something");
    const formB = formControlRef.current;

    // Manually submit the first form.
    await act(async () => formA?.submitForm());

    // Ensure the handler wasn't ever triggered.
    expect(onSubmit).not.toHaveBeenCalled();

    // Submit second form to ensure it's working.
    await act(async () => formB?.submitForm());
    expect(onSubmit).toHaveBeenCalled();
  });

  describe("validate", () => {
    it("initializes invalid", async ({ expect }) => {
      const onValidate = vi.fn();
      await act(() =>
        renderComponent(
          <ActionsList actions={actions} onValidate={onValidate} />,
        ),
      );

      expect(onValidate).toHaveBeenLastCalledWith(false);
    });

    it("valid with value", async ({ expect }) => {
      const onValidate = vi.fn();
      const { result } = renderComponent(
        <ActionsList actions={actions} onValidate={onValidate} />,
      );

      await userEvent.click(result.getByLabelText("required"));
      await userEvent.type(result.getByLabelText("required-a"), "value");
      await userEvent.type(result.getByLabelText("required-b"), "value");

      expect(onValidate).toHaveBeenLastCalledWith(true);
    });

    it("invalid on switch", async ({ expect }) => {
      const onValidate = vi.fn();
      const { result } = renderComponent(
        <ActionsList actions={actions} onValidate={onValidate} />,
      );

      await userEvent.click(result.getByLabelText("optional"));
      expect(onValidate).toHaveBeenLastCalledWith(true);

      await userEvent.click(result.getByLabelText("required"));
      expect(onValidate).toHaveBeenLastCalledWith(false);
    });
  });
});
