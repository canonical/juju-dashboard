import { screen } from "@testing-library/react";

import { renderComponent } from "testing/utils";

import Breadcrumb from "./Breadcrumb";

describe("Breadcrumb", () => {
  it("displays correctly on model details", () => {
    renderComponent(<Breadcrumb />, {
      path: "/models/:userName/:modelName",
      url: "/models/eggman@external/group-test",
    });
    expect(
      screen.queryByTestId("breadcrumb-application")
    ).not.toBeInTheDocument();
    expect(screen.getByTestId("breadcrumb-model")).toHaveTextContent(
      "group-test"
    );
  });

  it("displays correctly on application details", () => {
    renderComponent(<Breadcrumb />, {
      path: "/models/:userName/:modelName/app/:appName",
      url: "/models/eggman@external/group-test/app/easyrsa",
    });
    expect(screen.getByTestId("breadcrumb-items")).toHaveTextContent(
      "group-testApplicationseasyrsa"
    );
    expect(screen.getByTestId("breadcrumb-model")).toHaveTextContent(
      "group-test"
    );
    expect(screen.getByTestId("breadcrumb-section")).toHaveTextContent(
      "Applications"
    );
    expect(screen.getByTestId("breadcrumb-applications")).toHaveTextContent(
      "easyrsa"
    );
  });

  it("displays correctly on unit details", () => {
    renderComponent(<Breadcrumb />, {
      path: "/models/:userName/:modelName/app/:appName/unit/:unitId",
      url: "/models/eggman@external/group-test/app/logstash/unit/logstash-0",
    });
    expect(screen.getByTestId("breadcrumb-items")).toHaveTextContent(
      "group-testApplicationslogstashlogstash-0"
    );
    expect(screen.getByTestId("breadcrumb-model")).toHaveTextContent(
      "group-test"
    );
    expect(screen.getByTestId("breadcrumb-section")).toHaveTextContent(
      "Applications"
    );
    expect(screen.getByTestId("breadcrumb-units")).toHaveTextContent(
      "logstash-0"
    );
  });

  it("displays correctly on machine details", () => {
    renderComponent(<Breadcrumb />, {
      path: "/models/:userName/:modelName/machine/:machineId",
      url: "/models/eggman@external/group-test/machine/0",
    });
    expect(screen.getByTestId("breadcrumb-items")).toHaveTextContent(
      "group-testMachines0"
    );
    expect(screen.getByTestId("breadcrumb-model")).toHaveTextContent(
      "group-test"
    );
    expect(screen.getByTestId("breadcrumb-section")).toHaveTextContent(
      "Machines"
    );
    expect(screen.getByTestId("breadcrumb-machines")).toHaveTextContent("0");
  });
});
