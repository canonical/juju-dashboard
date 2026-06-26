import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { vi } from "vitest";

import { renderComponent } from "testing/utils";

import { FieldName } from "../types";

import YAMLErrorsModal from "./YAMLErrorsModal";
import type { YAMLErrors } from "./types";

describe("YAMLErrorsModal", () => {
  let initialValues: YAMLErrors;

  beforeEach(() => {
    initialValues = { invalidKeys: [], invalidValues: [], otherErrors: [] };
  });

  it("renders the modal with correct labels", () => {
    renderComponent(
      <YAMLErrorsModal
        errors={initialValues}
        yamlKey={FieldName.CONSTRAINT_YAML}
        onConfirm={vi.fn()}
        onClose={vi.fn()}
      />,
    );

    expect(screen.getByText(/invalid constraint values/i)).toBeInTheDocument();
  });

  it("renders errors properly", () => {
    renderComponent(
      <YAMLErrorsModal
        errors={{
          invalidKeys: [{ line: 2, message: "Unknown key: bad-key" }],
          invalidValues: [{ line: 3, message: "Expected a number" }],
          otherErrors: [
            { line: 1, message: "Invalid format. Expected <key>: <value>" },
          ],
        }}
        yamlKey={FieldName.CONFIG_YAML}
        onConfirm={vi.fn()}
        onClose={vi.fn()}
      />,
    );

    expect(
      screen.getByText(/Line 2: Unknown key: bad-key/),
    ).toBeInTheDocument();
    expect(screen.getByText(/Line 3: Expected a number/)).toBeInTheDocument();
    expect(screen.getByText(/Invalid format/)).toBeInTheDocument();
  });

  it("calls onConfirm when confirm button is clicked", async () => {
    const onConfirm = vi.fn();
    renderComponent(
      <YAMLErrorsModal
        errors={initialValues}
        yamlKey={FieldName.CONFIG_YAML}
        onConfirm={onConfirm}
        onClose={vi.fn()}
      />,
    );

    await userEvent.click(
      screen.getByRole("button", { name: "Switch to list view" }),
    );
    expect(onConfirm).toHaveBeenCalledOnce();
  });

  it("calls onClose when cancel button is clicked", async () => {
    const onClose = vi.fn();
    renderComponent(
      <YAMLErrorsModal
        errors={initialValues}
        yamlKey={FieldName.CONFIG_YAML}
        onConfirm={vi.fn()}
        onClose={onClose}
      />,
    );

    await userEvent.click(screen.getByRole("button", { name: "Cancel" }));
    expect(onClose).toHaveBeenCalledOnce();
  });
});
