import { act, fireEvent, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import type { RootState } from "store/store";
import { rootStateFactory } from "testing/factories";
import {
  generalStateFactory,
  configFactory,
  authUserInfoFactory,
} from "testing/factories/general";
import { modelStatusInfoFactory } from "testing/factories/juju/ClientV8";
import {
  modelInfoFactory,
  modelUserInfoFactory,
} from "testing/factories/juju/ModelManagerV10";
import {
  jujuStateFactory,
  modelDataFactory,
  modelListInfoFactory,
} from "testing/factories/juju/juju";
import { renderComponent } from "testing/utils";

import { FieldsLabel } from "./Fields";
import UpgradeModelVersion from "./UpgradeModelVersion";
import { Label } from "./types";

describe("UpgradeModelVersion", () => {
  let state: RootState;

  beforeEach(() => {
    state = rootStateFactory.build({
      general: generalStateFactory.build({
        config: configFactory.build({
          isJuju: false,
          controllerAPIEndpoint: "wss://example.com/api",
        }),
        controllerConnections: {
          "wss://example.com/api": {
            user: authUserInfoFactory.build(),
          },
        },
      }),
      juju: jujuStateFactory.build({
        models: {
          abc123: modelListInfoFactory.build({
            uuid: "abc123",
            name: "test1",
            wsControllerURL: "wss://example.com/api",
          }),
        },
        modelData: {
          abc123: modelDataFactory.build({
            info: modelInfoFactory.build({
              uuid: "abc123",
              name: "test1",
              "controller-uuid": "controller123",
              users: [
                modelUserInfoFactory.build({
                  user: "eggman@external",
                  access: "admin",
                }),
              ],
            }),
            model: modelStatusInfoFactory.build({
              version: "1.2.3",
            }),
          }),
        },
      }),
    });
  });

  it("handles a model that doesn't exist", async () => {
    const {
      result: { getNotificationByText },
    } = renderComponent(
      <UpgradeModelVersion
        firstRender
        modelName="none"
        onRemovePanelQueryParams={vi.fn()}
        qualifier="eggman@external"
        setVersion={vi.fn()}
      />,
      { state },
    );
    expect(
      getNotificationByText(Label.NOT_FOUND, { severity: "caution" }),
    ).toBeInTheDocument();
  });

  it("initially selects the recommended field", async () => {
    renderComponent(
      <UpgradeModelVersion
        firstRender
        modelName="test1"
        onRemovePanelQueryParams={vi.fn()}
        qualifier="eggman@external"
        setVersion={vi.fn()}
      />,
      { state },
    );
    expect(
      screen.getByRole("radio", { name: FieldsLabel.RECOMMENDED }),
    ).toBeChecked();
  });

  it("displays an error if the manual version is in the wrong format", async () => {
    renderComponent(
      <UpgradeModelVersion
        firstRender
        modelName="test1"
        onRemovePanelQueryParams={vi.fn()}
        qualifier="eggman@external"
        setVersion={vi.fn()}
      />,
      { state },
    );
    await userEvent.click(
      screen.getByRole("radio", { name: FieldsLabel.MANUAL }),
    );
    const input = screen.getByRole("textbox", { name: FieldsLabel.VERSION });
    await userEvent.type(input, "1.1.");
    // Vanilla doesn't display validation until the field loses focus.
    await act(() => fireEvent.blur(input));
    expect(input).toHaveAccessibleErrorMessage(Label.ERROR_FORMAT);
  });

  it("displays an error if the manual version is the same as the current version", async () => {
    renderComponent(
      <UpgradeModelVersion
        firstRender
        modelName="test1"
        onRemovePanelQueryParams={vi.fn()}
        qualifier="eggman@external"
        setVersion={vi.fn()}
      />,
      { state },
    );
    await userEvent.click(
      screen.getByRole("radio", { name: FieldsLabel.MANUAL }),
    );
    const input = screen.getByRole("textbox", { name: FieldsLabel.VERSION });
    await userEvent.type(input, "1.2.3");
    // Vanilla doesn't display validation until the field loses focus.
    await act(() => fireEvent.blur(input));
    expect(input).toHaveAccessibleErrorMessage(Label.ERROR_SAME);
  });

  it("displays an error if the manual version does not match any controllers", async () => {
    renderComponent(
      <UpgradeModelVersion
        firstRender
        modelName="test1"
        onRemovePanelQueryParams={vi.fn()}
        qualifier="eggman@external"
        setVersion={vi.fn()}
      />,
      { state },
    );
    await userEvent.click(
      screen.getByRole("radio", { name: FieldsLabel.MANUAL }),
    );
    const input = screen.getByRole("textbox", { name: FieldsLabel.VERSION });
    await userEvent.type(input, "1.2.4");
    // Vanilla doesn't display validation until the field loses focus.
    await act(() => fireEvent.blur(input));
    expect(input).toHaveAccessibleErrorMessage(Label.ERROR_NO_CONTROLLERS);
  });

  it("displays an error if the manual version is older than the current version", async () => {
    state.juju.modelData.abc123.model.version = "2.9.2";
    renderComponent(
      <UpgradeModelVersion
        firstRender
        modelName="test1"
        onRemovePanelQueryParams={vi.fn()}
        qualifier="eggman@external"
        setVersion={vi.fn()}
      />,
      { state },
    );
    await userEvent.click(
      screen.getByRole("radio", { name: FieldsLabel.MANUAL }),
    );
    const input = screen.getByRole("textbox", { name: FieldsLabel.VERSION });
    await userEvent.type(input, "2.9.1");
    // Vanilla doesn't display validation until the field loses focus.
    await act(() => fireEvent.blur(input));
    expect(input).toHaveAccessibleErrorMessage(Label.ERROR_OLDER);
  });

  it("returns a recommended version when the form is submitted", async () => {
    const setVersion = vi.fn();
    renderComponent(
      <UpgradeModelVersion
        firstRender
        modelName="test1"
        onRemovePanelQueryParams={vi.fn()}
        qualifier="eggman@external"
        setVersion={setVersion}
      />,
      { state },
    );
    await userEvent.click(
      screen.getByRole("radio", { name: FieldsLabel.MANUAL }),
    );
    await userEvent.click(
      screen.getByRole("radio", { name: FieldsLabel.RECOMMENDED }),
    );
    await userEvent.click(screen.getByRole("radio", { name: "4.0.1" }));
    await userEvent.click(screen.getByRole("button", { name: Label.SUBMIT }));
    expect(setVersion).toHaveBeenCalledWith({
      date: "2006-01-02",
      lts: false,
      version: "4.0.1",
      "link-to-release": "https://github.com/juju/juju/releases/tag/v4.0.1",
      "requires-migration": true,
    });
  });

  it("returns a manual version when the form is submitted", async () => {
    const setVersion = vi.fn();
    renderComponent(
      <UpgradeModelVersion
        firstRender
        modelName="test1"
        onRemovePanelQueryParams={vi.fn()}
        qualifier="eggman@external"
        setVersion={setVersion}
      />,
      { state },
    );
    await userEvent.click(
      screen.getByRole("radio", { name: FieldsLabel.MANUAL }),
    );
    await userEvent.type(
      screen.getByRole("textbox", { name: FieldsLabel.VERSION }),
      "3.6.14",
    );
    await userEvent.click(screen.getByRole("button", { name: Label.SUBMIT }));
    expect(setVersion).toHaveBeenCalledWith({
      date: "2006-01-02",
      lts: true,
      version: "3.6.14",
      "link-to-release": "https://github.com/juju/juju/releases/tag/v3.6.14",
      "requires-migration": true,
    });
  });
});
