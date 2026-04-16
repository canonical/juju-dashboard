import { screen } from "@testing-library/react";
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
import { versionElemFactory } from "testing/factories/juju/jimm";
import {
  controllerFactory,
  modelListInfoFactory,
  modelDataFactory,
} from "testing/factories/juju/juju";
import { renderComponent } from "testing/utils";

import RecommendedVersion from "./RecommendedVersion";
import { Label, TestId } from "./types";

describe("RecommendedVersion", () => {
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
              version: "3.6.14",
              name: "controller1",
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
      }),
    });
  });

  it("displays the version details", async () => {
    renderComponent(
      <Formik initialValues={{}} onSubmit={vi.fn()}>
        <RecommendedVersion
          modelName="test1"
          qualifier="eggman@external"
          name="version"
          version={versionElemFactory.build({
            date: "2006-01-02",
            version: "3.5.14",
          })}
        />
      </Formik>,
      { state },
    );
    expect(screen.getByRole("radio", { name: "3.5.14" })).toBeInTheDocument();
    expect(
      document.querySelector(".recommended-version__radio-date"),
    ).toHaveTextContent("2 Jan 2006");
  });

  it("displays tags for an LTS", async () => {
    renderComponent(
      <Formik initialValues={{}} onSubmit={vi.fn()}>
        <RecommendedVersion
          modelName="test1"
          qualifier="eggman@external"
          name="version"
          version={versionElemFactory.build({
            version: "3.6.14",
          })}
        />
      </Formik>,
      { state },
    );
    expect(document.querySelector(".p-chip--information")).toHaveTextContent(
      Label.LTS,
    );
    expect(document.querySelector(".p-chip--positive")).toHaveTextContent(
      Label.RECOMMENDED,
    );
  });

  it("does not display tags for non-LTS versions", async () => {
    renderComponent(
      <Formik initialValues={{}} onSubmit={vi.fn()}>
        <RecommendedVersion
          modelName="test1"
          qualifier="eggman@external"
          name="version"
          version={versionElemFactory.build({
            version: "3.5.14",
          })}
        />
      </Formik>,
      { state },
    );
    expect(document.querySelector(".p-chip--information")).toBeNull();
    expect(document.querySelector(".p-chip--positive")).toBeNull();
  });

  it("displays upgrade path when a migration is required", async () => {
    state.juju.modelData.abc123.model.version = "1.2.3";
    renderComponent(
      <Formik initialValues={{}} onSubmit={vi.fn()}>
        <RecommendedVersion
          modelName="test1"
          qualifier="eggman@external"
          name="version"
          version={versionElemFactory.build({
            version: "3.5.14",
          })}
        />
      </Formik>,
      { state },
    );
    expect(screen.getByTestId(TestId.UPGRADE_PATH)).toHaveTextContent(
      "Upgrade path: 1.2.3 → Migrate → 3.5.14",
    );
  });
});
