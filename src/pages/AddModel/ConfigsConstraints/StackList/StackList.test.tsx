import { screen } from "@testing-library/react";
import { Formik } from "formik";
import { vi } from "vitest";

import { renderComponent } from "testing/utils";

import type { CategoryDefinition } from "../configCatalog";

import StackList from "./StackList";

const iconClass = ".p-icon--status-in-progress-small";

describe("StackList", () => {
  const mockCategory: CategoryDefinition = {
    category: "Networking",
    fields: [
      {
        label: "default-space",
        description: "The default network space",
        defaultValue: "alpha",
      },
      {
        label: "container-networking-method",
        description: "The method of container networking setup",
        defaultValue: "local",
        input: {
          type: "select",
          options: [
            { label: "local", value: "local" },
            { label: "fan", value: "fan" },
          ],
        },
      },
      {
        label: "egress-subnets",
        description: "Subnets to use for egress",
      },
    ],
  };

  it("renders properly", () => {
    renderComponent(
      <Formik initialValues={{}} onSubmit={vi.fn()}>
        <StackList visibleConfigs={mockCategory.fields} />
      </Formik>,
    );

    expect(screen.getByText("default-space")).toBeInTheDocument();
    expect(screen.getByText("The default network space")).toBeInTheDocument();
  });

  it("does not show a changed indicator when fields have default values", () => {
    renderComponent(
      <Formik
        initialValues={{
          "default-space": "alpha",
          "container-networking-method": "local",
        }}
        onSubmit={vi.fn()}
      >
        <StackList visibleConfigs={mockCategory.fields} />
      </Formik>,
    );

    const icon = document.querySelector(iconClass);
    expect(icon).not.toBeInTheDocument();
  });

  it("shows a changed indicator when field value differs from default", () => {
    renderComponent(
      <Formik
        initialValues={{
          "default-space": "modified-space",
          "container-networking-method": "local",
        }}
        onSubmit={vi.fn()}
      >
        <StackList visibleConfigs={mockCategory.fields} />
      </Formik>,
    );

    const icon = document.querySelector(iconClass);
    expect(icon).toBeInTheDocument();
  });
});
