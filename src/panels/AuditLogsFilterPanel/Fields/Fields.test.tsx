import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Formik } from "formik";
import { vi } from "vitest";

import type { RootState } from "store/store";
import { rootStateFactory, jujuStateFactory } from "testing/factories";
import {
  modelInfoFactory,
  modelUserInfoFactory,
} from "testing/factories/juju/ModelManagerV10";
import { auditEventFactory } from "testing/factories/juju/jimm";
import {
  auditEventsStateFactory,
  modelListInfoFactory,
  modelDataFactory,
  controllerFactory,
} from "testing/factories/juju/juju";
import { renderComponent } from "testing/utils";
import urls from "urls";

import Fields from "./Fields";
import { Label } from "./types";

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
    vi.restoreAllMocks();
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
        info: modelInfoFactory.build({
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
      <Formik initialValues={{}} onSubmit={vi.fn()}>
        <Fields />
      </Formik>,
      { state },
    );
    await userEvent.click(screen.getByRole("textbox", { name: Label.USER }));
    expect(screen.getByRole("option", { name: "eggman" })).toBeInTheDocument();
    expect(
      screen.getByRole("option", { name: "spaceman" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("option", { name: "policeman" }),
    ).toBeInTheDocument();
  });

  it("should suggest model options", async () => {
    state.juju.auditEvents.items = [
      auditEventFactory.build({
        model: "controller1/test-model1",
      }),
      auditEventFactory.build({
        model: "controller1/test-model1",
      }),
      auditEventFactory.build({
        model: "controller2/test-model2",
      }),
    ];
    state.juju.models = {
      abc123: modelListInfoFactory.build({
        name: "test-model1",
        wsControllerURL: "wss://example.com/api",
      }),
      def456: modelListInfoFactory.build({
        name: "test-model3",
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
      <Formik initialValues={{}} onSubmit={vi.fn()}>
        <Fields />
      </Formik>,
      {
        state,
      },
    );
    await userEvent.click(screen.getByRole("textbox", { name: Label.MODEL }));
    expect(
      screen.getByRole("option", { name: "controller1/test-model1" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("option", { name: "controller2/test-model2" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("option", { name: "controller3/test-model3" }),
    ).toBeInTheDocument();
  });

  it("can show the model field", async () => {
    renderComponent(
      <Formik initialValues={{}} onSubmit={vi.fn()}>
        <Fields />
      </Formik>,
      {
        state,
      },
    );
    expect(
      screen.getByRole("textbox", { name: Label.MODEL }),
    ).toBeInTheDocument();
  });

  it("can not show the model field", async () => {
    renderComponent(
      <Formik initialValues={{}} onSubmit={vi.fn()}>
        <Fields />
      </Formik>,
      {
        state,
        path: urls.model.index(null),
        url: urls.model.index({
          qualifier: "eggman@external",
          modelName: "test-model",
        }),
      },
    );
    expect(
      screen.queryByRole("textbox", { name: Label.MODEL }),
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
      <Formik initialValues={{}} onSubmit={vi.fn()}>
        <Fields />
      </Formik>,
      { state },
    );
    await userEvent.click(screen.getByRole("textbox", { name: Label.METHOD }));
    expect(screen.getByRole("option", { name: "Login" })).toBeInTheDocument();
    expect(
      await screen.findByRole("option", { name: "AddModel" }),
    ).toBeInTheDocument();
  });
});
