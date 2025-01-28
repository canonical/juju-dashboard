import { screen } from "@testing-library/react";

import { endpoints } from "juju/jimm/api";
import { renderComponent } from "testing/utils";

import { Label } from "../types";

import OIDCForm from "./OIDCForm";

describe("OIDCForm", () => {
  afterEach(() => localStorage.clear());
  it("should render a login link", () => {
    renderComponent(<OIDCForm />);
    expect(
      screen.getByRole("link", { name: Label.LOGIN_TO_DASHBOARD }),
    ).toHaveAttribute("href", endpoints().login);
  });

  it("should render spinner after getting redirected", () => {
    localStorage.setItem("firstVisit", "false");
    renderComponent(<OIDCForm />);
    expect(
      screen.getByRole("link", { name: Label.LOADING }),
    ).toBeInTheDocument();
  });
});
