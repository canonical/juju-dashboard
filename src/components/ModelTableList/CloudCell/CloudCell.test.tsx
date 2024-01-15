import { render, screen } from "@testing-library/react";

import {
  modelDataFactory,
  modelDataInfoFactory,
} from "testing/factories/juju/juju";

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

  it("can generate an AWS logo", () => {
    render(
      <CloudCell
        model={modelDataFactory.build({
          info: modelDataInfoFactory.build({
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
          info: modelDataInfoFactory.build({
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
          info: modelDataInfoFactory.build({
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
          info: modelDataInfoFactory.build({
            "provider-type": "kubernetes",
          }),
        })}
      />,
    );
    expect(screen.getByRole("img")).toHaveAttribute("alt", "Kubernetes logo");
  });
});
