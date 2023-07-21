import { screen } from "@testing-library/react";

// import * as apiModule from "juju/api";
import { renderComponent } from "testing/utils";

import { TestId as ActionsPanelTestId } from "./ActionsPanel/ActionsPanel";
import { TestId as CharmsAndActionsPanelTestId } from "./CharmsAndActionsPanel/CharmsAndActionsPanel";
import { TestId as ConfigPanelTestId } from "./ConfigPanel/ConfigPanel";
import Panels from "./Panels";
import { Label as RegisterControllerLabel } from "./RegisterController/RegisterController";
import { TestId as ShareModelTestId } from "./ShareModelPanel/ShareModel";

// jest.mock("juju/api", () => ({
//   ...jest.requireActual("juju/api"),
//   getCharmsURLFromApplications: jest.fn(),
// }));

describe("Panels", () => {
  it("can display the register controller panel", () => {
    renderComponent(<Panels />, { url: "/?panel=register-controller" });
    expect(
      screen.getByRole("dialog", { name: RegisterControllerLabel.TITLE })
    ).toBeInTheDocument();
  });

  it("can display the actions panel", () => {
    renderComponent(<Panels />, { url: "/?panel=execute-action" });
    expect(screen.getByTestId(ActionsPanelTestId.PANEL)).toBeInTheDocument();
  });

  it("can display the share panel", () => {
    renderComponent(<Panels />, { url: "/?panel=share-model" });
    expect(screen.getByTestId(ShareModelTestId.PANEL)).toBeInTheDocument();
  });

  it("can display the choose charm panel", async () => {
    // jest
    //   .spyOn(apiModule, "getCharmsURLFromApplications")
    //   .mockImplementation(() => Promise.resolve(["mockCharmsURL"]));
    renderComponent(<Panels />, { url: "/?panel=select-charms-and-actions" });
    expect(
      screen.getByTestId(CharmsAndActionsPanelTestId.PANEL)
    ).toBeInTheDocument();
  });

  it("can display the config panel", async () => {
    renderComponent(<Panels />, {
      url: "/?panel=config&entity=easyrsa&charm=cs:easyrsa&modelUUID=abc123",
    });
    expect(
      await screen.findByTestId(ConfigPanelTestId.PANEL)
    ).toBeInTheDocument();
  });
});
