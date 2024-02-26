import { screen } from "@testing-library/react";

import { renderComponent } from "testing/utils";

import ChangedKeyValues from "./ChangedKeyValues";

describe("ChangedKeyValues", () => {
  it("displays keys and values", async () => {
    renderComponent(
      <ChangedKeyValues
        appName="etcd"
        config={{
          storage: {
            name: "storage",
            default: "eggman",
            description: "a username",
            source: "default",
            type: "string",
            value: "eggmant1",
            newValue: "eggman2",
          },
        }}
      />,
    );
    expect(
      screen.getByRole("heading", { name: "storage" }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("code", { name: "eggman2" }),
    ).not.toBeInTheDocument();
  });

  it("displays boolean values", async () => {
    renderComponent(
      <ChangedKeyValues
        appName="etcd"
        config={{
          storage: {
            name: "storage",
            default: false,
            description: "a username",
            source: "default",
            type: "boolean",
            value: false,
            newValue: true,
          },
        }}
      />,
    );
    expect(
      screen.getByRole("heading", { name: "storage" }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("code", { name: "true" }),
    ).not.toBeInTheDocument();
  });
});
