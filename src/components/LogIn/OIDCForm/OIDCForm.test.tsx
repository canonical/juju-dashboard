import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { endpoints } from "juju/jimm/api";
import { renderComponent } from "testing/utils";

import { Label } from "../types";

import OIDCForm from "./OIDCForm";

const setItemSpy = vi.spyOn(Storage.prototype, "setItem");

describe("OIDCForm", () => {
  afterEach(() => {
    localStorage.clear();
    setItemSpy.mockClear();
  });
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

  it("should set local storage for first visit on click", async () => {
    renderComponent(<OIDCForm />);
    await userEvent.click(
      screen.getByRole("link", { name: Label.LOGIN_TO_DASHBOARD }),
    );
    expect(setItemSpy).toHaveBeenCalledWith("firstVisit", "false");
  });
});
