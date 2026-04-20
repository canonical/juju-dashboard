import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Formik } from "formik";

import type { RootState } from "store/store";
import { rootStateFactory, jujuStateFactory } from "testing/factories";
import {
  generalStateFactory,
  configFactory,
  authUserInfoFactory,
} from "testing/factories/general";
import { modelUserInfoFactory } from "testing/factories/juju/ModelManagerV10";
import { modelInfoFactory } from "testing/factories/juju/ModelManagerV11";
import {
  versionElemFactory,
  modelMigrationTargetFactory,
} from "testing/factories/juju/jimm";
import {
  controllerFactory,
  modelListInfoFactory,
  modelDataFactory,
  modelMigrationTargetsStateFactory,
  supportedJujuVersionsStateFactory,
} from "testing/factories/juju/juju";
import { renderComponent } from "testing/utils";

import { FieldName } from "../types";

import Fields from "./Fields";
import { Label, TestId } from "./types";

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
      controllers: {
        "wss://jimm.jujucharms.com/api": [
          controllerFactory.build({
            uuid: "controller123",
            version: "1.2.3",
          }),
          controllerFactory.build({
            uuid: "controller456",
            version: "3.6.20",
          }),
        ],
      },
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
        }),
      },
      supportedJujuVersions: supportedJujuVersionsStateFactory.build({
        data: [
          versionElemFactory.build({ version: "1.2.3" }),
          versionElemFactory.build({ version: "3.6.20" }),
        ],
      }),
      modelMigrationTargets: modelMigrationTargetsStateFactory.build({
        abc123: modelMigrationTargetFactory.build({
          data: ["controller123", "controller456"],
        }),
      }),
    }),
  });
});

it("can display the recommended fields", async () => {
  renderComponent(
    <Formik
      initialValues={{
        [FieldName.MANUAL_VERSION]: "",
        [FieldName.RECOMMENDED_VERSION]: "",
        [FieldName.UPGRADE_TYPE]: "",
      }}
      onSubmit={vi.fn()}
    >
      <Fields modelName="test1" qualifier="eggman@external" />
    </Formik>,
    { state },
  );
  expect(screen.queryByTestId(TestId.RECOMMENDED)).not.toBeInTheDocument();
  await userEvent.click(screen.getByRole("radio", { name: Label.RECOMMENDED }));
  expect(screen.getByTestId(TestId.RECOMMENDED)).toBeInTheDocument();
  expect(screen.queryByTestId(TestId.MANUAL)).not.toBeInTheDocument();
});

it("can display the manual fields", async () => {
  renderComponent(
    <Formik
      initialValues={{
        [FieldName.MANUAL_VERSION]: "",
        [FieldName.RECOMMENDED_VERSION]: "",
        [FieldName.UPGRADE_TYPE]: "",
      }}
      onSubmit={vi.fn()}
    >
      <Fields modelName="test1" qualifier="eggman@external" />
    </Formik>,
    { state },
  );
  expect(screen.queryByTestId(TestId.MANUAL)).not.toBeInTheDocument();
  await userEvent.click(screen.getByRole("radio", { name: Label.MANUAL }));
  expect(screen.getByTestId(TestId.MANUAL)).toBeInTheDocument();
  expect(screen.queryByTestId(TestId.RECOMMENDED)).not.toBeInTheDocument();
});

it("suggests versions", async () => {
  renderComponent(
    <Formik
      initialValues={{
        [FieldName.MANUAL_VERSION]: "",
        [FieldName.RECOMMENDED_VERSION]: "",
        [FieldName.UPGRADE_TYPE]: "",
      }}
      onSubmit={vi.fn()}
    >
      <Fields modelName="test1" qualifier="eggman@external" />
    </Formik>,
    { state },
  );
  await userEvent.click(screen.getByRole("radio", { name: Label.MANUAL }));
  await userEvent.click(screen.getByRole("textbox", { name: Label.VERSION }));
  expect(screen.getByRole("option", { name: "1.2.3" })).toBeInTheDocument();
  expect(screen.getByRole("option", { name: "3.6.20" })).toBeInTheDocument();
});
