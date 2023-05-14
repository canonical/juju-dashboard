import { render, screen } from "@testing-library/react";
import { Provider } from "react-redux";
import { BrowserRouter } from "react-router-dom";
import configureStore from "redux-mock-store";

import { rootStateFactory } from "testing/factories/root";

import { TestId as ActionsPanelTestId } from "./ActionsPanel/ActionsPanel";
import { TestId as CharmActionsTestId } from "./ActionsPanel/CharmActionsPanel";
import { Label as CharmsPanelLabel } from "./CharmsPanel/CharmsPanel";
import { TestId as ConfigPanelTestId } from "./ConfigPanel/ConfigPanel";
import Panels from "./Panels";
import { Label as RegisterControllerLabel } from "./RegisterController/RegisterController";
import { TestId as ShareModelTestId } from "./ShareModelPanel/ShareModel";

const mockStore = configureStore([]);

describe("Panels", () => {
  it("can display the register controller panel", () => {
    const store = mockStore(rootStateFactory.build());
    window.history.pushState({}, "", "/?panel=register-controller");
    render(
      <Provider store={store}>
        <BrowserRouter>
          <Panels />
        </BrowserRouter>
      </Provider>
    );
    expect(
      screen.getByRole("dialog", { name: RegisterControllerLabel.TITLE })
    ).toBeInTheDocument();
  });

  it("can display the actions panel", () => {
    const store = mockStore(rootStateFactory.build());
    window.history.pushState({}, "", "/?panel=execute-action");
    render(
      <Provider store={store}>
        <BrowserRouter>
          <Panels />
        </BrowserRouter>
      </Provider>
    );
    expect(screen.getByTestId(ActionsPanelTestId.PANEL)).toBeInTheDocument();
  });

  it("can display the share panel", () => {
    const store = mockStore(rootStateFactory.build());
    window.history.pushState({}, "", "/?panel=share-model");
    render(
      <Provider store={store}>
        <BrowserRouter>
          <Panels />
        </BrowserRouter>
      </Provider>
    );
    expect(screen.getByTestId(ShareModelTestId.PANEL)).toBeInTheDocument();
  });

  it("can display the choose charm panel", () => {
    const store = mockStore(rootStateFactory.build());
    window.history.pushState({}, "", "/?panel=choose-charm");
    render(
      <Provider store={store}>
        <BrowserRouter>
          <Panels />
        </BrowserRouter>
      </Provider>
    );
    expect(
      screen.getByRole("dialog", { name: CharmsPanelLabel.TITLE })
    ).toBeInTheDocument();
  });

  it("can display the charm actions panel", () => {
    const store = mockStore(rootStateFactory.build());
    window.history.pushState({}, "", "/?panel=charm-actions");
    render(
      <Provider store={store}>
        <BrowserRouter>
          <Panels />
        </BrowserRouter>
      </Provider>
    );
    expect(screen.getByTestId(CharmActionsTestId.PANEL)).toBeInTheDocument();
  });

  it("can display the config panel", async () => {
    const store = mockStore(rootStateFactory.build());
    window.history.pushState(
      {},
      "",
      "/?panel=config&entity=easyrsa&charm=cs:easyrsa&modelUUID=abc123"
    );
    render(
      <Provider store={store}>
        <BrowserRouter>
          <Panels />
        </BrowserRouter>
      </Provider>
    );
    expect(
      await screen.findByTestId(ConfigPanelTestId.PANEL)
    ).toBeInTheDocument();
  });
});
