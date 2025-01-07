import { screen } from "@testing-library/react";

import { endpoints } from "juju/jimm/api";
import { renderComponent } from "testing/utils";

import { Label } from "../types";

import OIDCForm from "./OIDCForm";

describe("OIDCForm", () => {
  it("should render a login link", () => {
    renderComponent(<OIDCForm />);
    expect(
      screen.getByRole("link", { name: Label.LOGIN_TO_DASHBOARD }),
    ).toHaveAttribute("href", endpoints().login);
  });
});
