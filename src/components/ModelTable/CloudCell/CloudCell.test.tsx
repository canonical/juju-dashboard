import { render, screen } from "@testing-library/react";

import { modelInfoFactory } from "testing/factories/juju/ModelManagerV10";
import { modelDataFactory } from "testing/factories/juju/juju";

import CloudCell from "./CloudCell";

describe("CloudCell", () => {
  it("handles no provider", () => {
    render(
      <CloudCell
        model={modelDataFactory.build({
          info: undefined,
        })}
      />,
    );
    expect(screen.queryByRole("img")).not.toBeInTheDocument();
  });

  it("wraps the logo and region text in a single-line cell", () => {
    const { container } = render(
      <CloudCell
        model={modelDataFactory.build({
          info: modelInfoFactory.build({
            "provider-type": "ec2",
          }),
        })}
      />,
    );
    const cell = container.querySelector(".models__cloud-cell");
    expect(cell).not.toBeNull();
    expect(cell?.querySelector("img.p-table__logo")).not.toBeNull();
    expect(cell?.querySelector(".truncated-tooltip")).not.toBeNull();
  });

  it("can generate an AWS logo", () => {
    render(
      <CloudCell
        model={modelDataFactory.build({
          info: modelInfoFactory.build({
            "provider-type": "ec2",
          }),
        })}
      />,
    );
    expect(screen.getByRole("img")).toHaveAttribute("alt", "AWS logo");
  });

  it("can generate a GCE logo", () => {
    render(
      <CloudCell
        model={modelDataFactory.build({
          info: modelInfoFactory.build({
            "provider-type": "gce",
          }),
        })}
      />,
    );
    expect(screen.getByRole("img")).toHaveAttribute(
      "alt",
      "Google Cloud Platform logo",
    );
  });

  it("can generate an Azure logo", () => {
    render(
      <CloudCell
        model={modelDataFactory.build({
          info: modelInfoFactory.build({
            "provider-type": "azure",
          }),
        })}
      />,
    );
    expect(screen.getByRole("img")).toHaveAttribute("alt", "Azure logo");
  });

  it("can generate a Kubernetes logo", () => {
    render(
      <CloudCell
        model={modelDataFactory.build({
          info: modelInfoFactory.build({
            "provider-type": "kubernetes",
          }),
        })}
      />,
    );
    expect(screen.getByRole("img")).toHaveAttribute("alt", "Kubernetes logo");
  });
});
