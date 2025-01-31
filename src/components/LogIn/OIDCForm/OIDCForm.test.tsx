import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { endpoints } from "juju/jimm/api";
import * as dashboardStore from "store/store";
import { rootStateFactory } from "testing/factories";
import { generalStateFactory } from "testing/factories/general";
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

  it("should render spinner after getting redirected", () => {
    const state = rootStateFactory.build({
      general: generalStateFactory.build({
        login: {
          errors: {},
          loading: true,
        },
      }),
    });
    renderComponent(<OIDCForm />, { state });
    expect(
      screen.getByRole("button", { name: Label.LOADING }),
    ).toBeInTheDocument();
  });

  it("should dispatch event to update loading state on click", async () => {
    const mockUseAppDispatch = vi.fn().mockReturnValue({
      then: vi.fn().mockReturnValue({ catch: vi.fn() }),
    });
    vi.spyOn(dashboardStore, "useAppDispatch").mockReturnValue(
      mockUseAppDispatch,
    );
    renderComponent(<OIDCForm />);
    await userEvent.click(
      screen.getByRole("link", { name: Label.LOGIN_TO_DASHBOARD }),
    );
    expect(mockUseAppDispatch.mock.calls[0][0]).toMatchObject({
      type: "general/updateLoginLoading",
    });
  });
});
