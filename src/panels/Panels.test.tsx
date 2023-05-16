import { screen } from "@testing-library/react";

import { renderComponent } from "testing/utils";

import { TestId as ActionsPanelTestId } from "./ActionsPanel/ActionsPanel";
import { TestId as CharmActionsTestId } from "./ActionsPanel/CharmActionsPanel";
import { Label as CharmsPanelLabel } from "./CharmsPanel/CharmsPanel";
import { TestId as ConfigPanelTestId } from "./ConfigPanel/ConfigPanel";
import Panels from "./Panels";
import { Label as RegisterControllerLabel } from "./RegisterController/RegisterController";
import { TestId as ShareModelTestId } from "./ShareModelPanel/ShareModel";

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

  it("can display the choose charm panel", () => {
    renderComponent(<Panels />, { url: "/?panel=choose-charm" });
    expect(
      screen.getByRole("dialog", { name: CharmsPanelLabel.TITLE })
    ).toBeInTheDocument();
  });

  it("can display the charm actions panel", () => {
    renderComponent(<Panels />, { url: "/?panel=charm-actions" });
    expect(screen.getByTestId(CharmActionsTestId.PANEL)).toBeInTheDocument();
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
