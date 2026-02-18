import { screen } from "@testing-library/react";

import { ModelActionsTestId } from "components/ModelActions";
import { renderComponent } from "testing/utils";

import Breadcrumb from "./Breadcrumb";
import { TestId } from "./types";

describe("Breadcrumb", () => {
  it("displays model actions", () => {
    renderComponent(<Breadcrumb />, {
      path: "/models/:qualifier/:modelName",
      url: "/models/eggman@external/group-test",
    });
    expect(screen.getByTestId(ModelActionsTestId.MENU)).toBeInTheDocument();
  });

  it("displays correctly on model details", () => {
    renderComponent(<Breadcrumb />, {
      path: "/models/:qualifier/:modelName",
      url: "/models/eggman@external/group-test",
    });
    expect(screen.queryByTestId(TestId.APPLICATIONS)).not.toBeInTheDocument();
    expect(screen.getByTestId(TestId.MODEL)).toHaveTextContent("group-test");
  });

  it("displays correctly on application details", () => {
    renderComponent(<Breadcrumb />, {
      path: "/models/:qualifier/:modelName/app/:appName",
      url: "/models/eggman@external/group-test/app/easyrsa",
    });
    expect(screen.getByTestId(TestId.ITEMS)).toHaveTextContent(
      "group-testApplicationseasyrsa", // spell-checker:disable-line
    );
    expect(screen.getByTestId(TestId.MODEL)).toHaveTextContent("group-test");
    expect(screen.getByTestId(TestId.SECTION)).toHaveTextContent(
      "Applications",
    );
    expect(screen.getByTestId(TestId.APPLICATIONS)).toHaveTextContent(
      "easyrsa",
    );
  });

  it("displays correctly on unit details", () => {
    renderComponent(<Breadcrumb />, {
      path: "/models/:qualifier/:modelName/app/:appName/unit/:unitId",
      url: "/models/eggman@external/group-test/app/logstash/unit/logstash-0",
    });
    expect(screen.getByTestId(TestId.ITEMS)).toHaveTextContent(
      "group-testApplicationslogstashlogstash-0", // spell-checker:disable-line
    );
    expect(screen.getByTestId(TestId.MODEL)).toHaveTextContent("group-test");
    expect(screen.getByTestId(TestId.SECTION)).toHaveTextContent(
      "Applications",
    );
    expect(screen.getByTestId(TestId.UNITS)).toHaveTextContent("logstash-0");
  });

  it("displays correctly on machine details", () => {
    renderComponent(<Breadcrumb />, {
      path: "/models/:qualifier/:modelName/machine/:machineId",
      url: "/models/eggman@external/group-test/machine/0",
    });
    expect(screen.getByTestId(TestId.ITEMS)).toHaveTextContent(
      "group-testMachines0",
    );
    expect(screen.getByTestId(TestId.MODEL)).toHaveTextContent("group-test");
    expect(screen.getByTestId(TestId.SECTION)).toHaveTextContent("Machines");
    expect(screen.getByTestId(TestId.MACHINES)).toHaveTextContent("0");
  });
});
