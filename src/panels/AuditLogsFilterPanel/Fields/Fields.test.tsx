import { screen } from "@testing-library/react";
import { Formik } from "formik";

import type { RootState } from "store/store";
import { rootStateFactory, jujuStateFactory } from "testing/factories";
import { modelUserInfoFactory } from "testing/factories/juju/ModelManagerV9";
import { auditEventFactory } from "testing/factories/juju/jimm";
import {
  auditEventsStateFactory,
  modelListInfoFactory,
  modelDataFactory,
  modelDataInfoFactory,
  controllerFactory,
} from "testing/factories/juju/juju";
import { renderComponent } from "testing/utils";
import urls from "urls";

import Fields, { Label } from "./Fields";

describe("Fields", () => {
  let state: RootState;

  beforeEach(() => {
    state = rootStateFactory.build({
      juju: jujuStateFactory.build({
        auditEvents: auditEventsStateFactory.build({
          items: [],
          loaded: true,
        }),
      }),
    });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("should suggest user options", async () => {
    state.juju.auditEvents.items = [
      auditEventFactory.build({
        "user-tag": "user-eggman",
      }),
      auditEventFactory.build({
        "user-tag": "user-spaceman",
      }),
      auditEventFactory.build({
        "user-tag": "user-eggman",
      }),
    ];
    state.juju.modelData = {
      abc123: modelDataFactory.build({
        info: modelDataInfoFactory.build({
          users: [
            modelUserInfoFactory.build({
              user: "eggman",
            }),

            modelUserInfoFactory.build({
              user: "policeman",
            }),
          ],
        }),
      }),
    };
    renderComponent(
      <Formik initialValues={{}} onSubmit={jest.fn()}>
        <Fields />
      </Formik>,
      { state }
    );
    expect(
      document.querySelector("option[value='eggman']")
    ).toBeInTheDocument();
    expect(document.querySelectorAll("option[value='eggman']")).toHaveLength(1);
    expect(
      document.querySelector("option[value='spaceman']")
    ).toBeInTheDocument();
    expect(
      document.querySelector("option[value='policeman']")
    ).toBeInTheDocument();
  });

  it("should suggest model options", async () => {
    state.juju.auditEvents.items = [
      auditEventFactory.build({
        model: "controller1/testmodel1",
      }),
      auditEventFactory.build({
        model: "controller1/testmodel1",
      }),
      auditEventFactory.build({
        model: "controller2/testmodel2",
      }),
    ];
    state.juju.models = {
      abc123: modelListInfoFactory.build({
        name: "testmodel1",
        wsControllerURL: "wss://example.com/api",
      }),
      def456: modelListInfoFactory.build({
        name: "testmodel3",
        wsControllerURL: "wss://test.com/api",
      }),
    };
    state.juju.controllers = {
      "wss://example.com/api": [
        controllerFactory.build({ name: "controller1" }),
      ],
      "wss://test.com/api": [controllerFactory.build({ name: "controller3" })],
    };
    renderComponent(
      <Formik initialValues={{}} onSubmit={jest.fn()}>
        <Fields />
      </Formik>,
      {
        state,
      }
    );
    expect(
      document.querySelector("option[value='controller1/testmodel1']")
    ).toBeInTheDocument();
    expect(
      document.querySelectorAll("option[value='controller1/testmodel1']")
    ).toHaveLength(1);
    expect(
      document.querySelector("option[value='controller2/testmodel2']")
    ).toBeInTheDocument();
    expect(
      document.querySelector("option[value='controller3/testmodel3']")
    ).toBeInTheDocument();
  });

  it("can show the model field", async () => {
    renderComponent(
      <Formik initialValues={{}} onSubmit={jest.fn()}>
        <Fields />
      </Formik>,
      {
        state,
      }
    );
    expect(
      screen.getByRole("combobox", { name: Label.MODEL })
    ).toBeInTheDocument();
  });

  it("can not show the model field", async () => {
    renderComponent(
      <Formik initialValues={{}} onSubmit={jest.fn()}>
        <Fields />
      </Formik>,
      {
        state,
        path: urls.model.index(null),
        url: urls.model.index({
          userName: "eggman@external",
          modelName: "test-model",
        }),
      }
    );
    expect(
      screen.queryByRole("combobox", { name: Label.MODEL })
    ).not.toBeInTheDocument();
  });

  it("should suggest method options", async () => {
    state.juju.auditEvents.items = [
      auditEventFactory.build({
        "facade-method": "Login",
      }),
      auditEventFactory.build({
        "facade-method": "AddModel",
      }),
      auditEventFactory.build({
        "facade-method": "Login",
      }),
    ];
    renderComponent(
      <Formik initialValues={{}} onSubmit={jest.fn()}>
        <Fields />
      </Formik>,
      { state }
    );
    expect(document.querySelector("option[value='Login']")).toBeInTheDocument();
    expect(document.querySelectorAll("option[value='Login']")).toHaveLength(1);
    expect(
      document.querySelector("option[value='AddModel']")
    ).toBeInTheDocument();
  });
});
