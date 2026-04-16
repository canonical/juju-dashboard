import { NotificationSeverity } from "@canonical/react-components";
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
  modelMigrationTargetFactory,
  versionElemFactory,
} from "testing/factories/juju/jimm";
import {
  modelListInfoFactory,
  modelDataFactory,
  controllerFactory,
  modelMigrationTargetsStateFactory,
} from "testing/factories/juju/juju";
import { renderComponent } from "testing/utils";

import { FieldName } from "../types";

import Fields from "./Fields";
import { Label } from "./types";

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
        "wss://example.com/api": [
          controllerFactory.build({
            uuid: "controller123",
            version: "4.6.14",
            name: "controller1",
          }),
          controllerFactory.build({
            uuid: "controller456",
            version: "4.6.14",
            name: "controller2",
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
      modelMigrationTargets: modelMigrationTargetsStateFactory.build({
        abc123: modelMigrationTargetFactory.build({
          data: ["controller123", "controller456"],
        }),
      }),
    }),
  });
});

it("displays correctly when a migration is required", async () => {
  const {
    result: { queryNotificationByText },
  } = renderComponent(
    <Formik
      initialValues={{
        [FieldName.TARGET_CONTROLLER]: "",
        [FieldName.CONFIRM]: false,
      }}
      onSubmit={vi.fn()}
    >
      <Fields
        needsMigration
        modelName="test1"
        qualifier="eggman@external"
        version={versionElemFactory.build({ version: "4.6.14" })}
      />
    </Formik>,
    { state },
  );
  expect(
    screen.getByRole("combobox", { name: Label.TARGET_CONTROLLER }),
  ).toBeInTheDocument();
  expect(
    queryNotificationByText(Label.REVIEW_RISKS, { severity: "caution" }),
  ).not.toBeInTheDocument();
  expect(
    screen.queryByRole("checkbox", { name: Label.CONFIRM }),
  ).not.toBeInTheDocument();
});

it("displays confirmation when a migration is required", async () => {
  const {
    result: { queryNotificationByText },
  } = renderComponent(
    <Formik
      initialValues={{
        [FieldName.TARGET_CONTROLLER]: "",
        [FieldName.CONFIRM]: false,
      }}
      onSubmit={vi.fn()}
    >
      <Fields
        needsMigration
        modelName="test1"
        qualifier="eggman@external"
        version={versionElemFactory.build({ version: "4.6.14" })}
      />
    </Formik>,
    { state },
  );
  await userEvent.selectOptions(
    screen.getByRole("combobox", { name: Label.TARGET_CONTROLLER }),
    "controller1",
  );
  expect(
    queryNotificationByText(Label.REVIEW_RISKS, {
      severity: NotificationSeverity.CAUTION,
    }),
  ).toBeInTheDocument();
  expect(
    screen.getByRole("checkbox", { name: Label.CONFIRM }),
  ).toBeInTheDocument();
});

it("displays correctly when a migration is not required", async () => {
  const {
    result: { queryNotificationByText },
  } = renderComponent(
    <Formik
      initialValues={{
        [FieldName.TARGET_CONTROLLER]: "",
        [FieldName.CONFIRM]: false,
      }}
      onSubmit={vi.fn()}
    >
      <Fields
        needsMigration={false}
        modelName="test1"
        qualifier="eggman@external"
        version={versionElemFactory.build({ version: "4.6.14" })}
      />
    </Formik>,
    { state },
  );
  expect(
    screen.queryByRole("combobox", { name: Label.TARGET_CONTROLLER }),
  ).not.toBeInTheDocument();
  expect(
    queryNotificationByText(Label.REVIEW_RISKS, { severity: "caution" }),
  ).toBeInTheDocument();
  expect(
    screen.getByRole("checkbox", { name: Label.CONFIRM }),
  ).toBeInTheDocument();
});
