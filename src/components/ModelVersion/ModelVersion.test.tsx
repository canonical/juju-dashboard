import { screen } from "@testing-library/react";

import type { RootState } from "store/store";
import { rootStateFactory } from "testing/factories";
import { modelStatusInfoFactory } from "testing/factories/juju/ClientV8";
import { modelInfoFactory } from "testing/factories/juju/ModelManagerV11";
import {
  controllerFactory,
  jujuStateFactory,
  modelDataFactory,
  modelListInfoFactory,
} from "testing/factories/juju/juju";
import { renderComponent } from "testing/utils";

import ModelVersion from "./ModelVersion";

describe("ModelVersion", () => {
  let state: RootState;

  beforeEach(() => {
    state = rootStateFactory.build({
      juju: jujuStateFactory.build({
        models: {
          abc123: modelListInfoFactory.build({
            uuid: "abc123",
            name: "test-model",
            wsControllerURL: "wss://example.com/api",
          }),
        },
        modelData: {
          abc123: modelDataFactory.build({
            info: modelInfoFactory.build({
              "controller-uuid": "controller123",
            }),
            model: modelStatusInfoFactory.build({
              version: "5.6.7",
            }),
          }),
        },
        controllers: {
          "wss://example.com": [
            controllerFactory.build({
              uuid: "controller123",
              "agent-version": "8.9.10",
            }),
          ],
        },
      }),
    });
  });

  it("displays the model version", () => {
    renderComponent(
      <ModelVersion modelName="test-model" qualifier="eggman@external" />,
      { state },
    );
    expect(screen.getByText("5.6.7")).toBeInTheDocument();
  });

  it("displays when the version is the same as the controller", () => {
    state.juju.modelData.abc123.model.version = "1.2.3";
    state.juju.controllers = {
      "wss://example.com": [
        controllerFactory.build({
          uuid: "controller123",
          "agent-version": "1.2.3",
        }),
      ],
    };
    renderComponent(
      <ModelVersion modelName="test-model" qualifier="eggman@external" />,
      { state },
    );
    expect(document.querySelector(".p-chip")).toBeInTheDocument();
  });

  it("displays when the version is lower than the controller", () => {
    renderComponent(
      <ModelVersion modelName="test-model" qualifier="eggman@external" />,
      { state },
    );
    expect(document.querySelector(".p-chip--caution")).toBeInTheDocument();
  });

  it("can override the version", () => {
    renderComponent(
      <ModelVersion
        modelName="test-model"
        qualifier="eggman@external"
        versionOverride="99.99.99"
      />,
      { state },
    );
    expect(document.querySelector(".p-chip")).toHaveTextContent("99.99.99");
  });
});
