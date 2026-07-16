import { screen } from "@testing-library/react";
import { Formik } from "formik";
import { vi } from "vitest";

import { renderComponent } from "testing/utils";

import { ConfigCategory } from "../configCatalog";
import type { ConfigFieldEntry } from "../types";
import { FieldName, InputType } from "../types";

import StackList from "./StackList";

const iconClass = ".p-icon--status-in-progress-small";

describe("StackList", () => {
  let mockFields: ConfigFieldEntry[];

  beforeEach(() => {
    mockFields = [
      {
        label: "default-space",
        description: "The default network space",
        defaultValue: "alpha",
        category: ConfigCategory.NETWORKING,
        value: "alpha",
        arrayIndex: 0,
      },
      {
        label: "container-networking-method",
        description: "The method of container networking setup",
        defaultValue: "local",
        category: ConfigCategory.NETWORKING,
        value: "local",
        arrayIndex: 1,
        input: {
          type: InputType.SELECT,
          options: [
            { label: "local", value: "local" },
            { label: "fan", value: "fan" },
          ],
        },
      },
      {
        label: "egress-subnets",
        description: "Subnets to use for egress",
        category: ConfigCategory.NETWORKING,
        value: "",
        arrayIndex: 2,
      },
    ];
  });

  it("renders properly", () => {
    renderComponent(
      <Formik
        initialValues={{ [FieldName.CONFIG_FIELDS]: mockFields }}
        onSubmit={vi.fn()}
      >
        <StackList
          visibleFields={mockFields}
          arrayName={FieldName.CONFIG_FIELDS}
        />
      </Formik>,
    );

    expect(screen.getByText("default-space")).toBeInTheDocument();
    expect(screen.getByText("The default network space")).toBeInTheDocument();
  });

  it("does not show a changed indicator when fields have default values", () => {
    renderComponent(
      <Formik
        initialValues={{ [FieldName.CONFIG_FIELDS]: mockFields }}
        onSubmit={vi.fn()}
      >
        <StackList
          visibleFields={mockFields}
          arrayName={FieldName.CONFIG_FIELDS}
        />
      </Formik>,
    );

    const icon = document.querySelector(iconClass);
    expect(icon).not.toBeInTheDocument();
  });

  it("shows a changed indicator when field value differs from default", () => {
    mockFields[0].value = "modified-space";
    renderComponent(
      <Formik
        initialValues={{ [FieldName.CONFIG_FIELDS]: mockFields }}
        onSubmit={vi.fn()}
      >
        <StackList
          visibleFields={mockFields}
          arrayName={FieldName.CONFIG_FIELDS}
        />
      </Formik>,
    );

    const icon = document.querySelector(iconClass);
    expect(icon).toBeInTheDocument();
  });
});
