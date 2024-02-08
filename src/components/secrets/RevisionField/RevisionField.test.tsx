import { screen } from "@testing-library/react";
import { Formik } from "formik";

import type { RootState } from "store/store";
import { rootStateFactory } from "testing/factories";
import {
  configFactory,
  generalStateFactory,
  credentialFactory,
} from "testing/factories/general";
import {
  modelListInfoFactory,
  secretsStateFactory,
  listSecretResultFactory,
  modelSecretsFactory,
  secretRevisionFactory,
} from "testing/factories/juju/juju";
import { renderComponent } from "testing/utils";
import urls from "urls";

import RevisionField from "./RevisionField";

jest.mock("components/utils", () => ({
  ...jest.requireActual("components/utils"),
  copyToClipboard: jest.fn(),
}));

describe("RevisionField", () => {
  let state: RootState;
  const path = urls.model.index(null);
  const url = urls.model.index({
    userName: "eggman@external",
    modelName: "test-model",
  });

  beforeEach(() => {
    state = rootStateFactory.build({
      general: generalStateFactory.build({
        credentials: {
          "wss://example.com/api": credentialFactory.build(),
        },
        config: configFactory.build({
          controllerAPIEndpoint: "wss://example.com/api",
        }),
      }),
      juju: {
        models: {
          abc123: modelListInfoFactory.build({
            wsControllerURL: "wss://example.com/api",
            uuid: "abc123",
          }),
        },
        secrets: secretsStateFactory.build({
          abc123: modelSecretsFactory.build({
            items: [
              listSecretResultFactory.build({
                uri: "secret:aabbccdd",
                label: "secret1",
                "latest-revision": 2,
                revisions: [
                  secretRevisionFactory.build({ revision: 1 }),
                  secretRevisionFactory.build({ revision: 2 }),
                ],
              }),
            ],
            loaded: true,
          }),
        }),
      },
    });
  });

  it("lists revisions", async () => {
    renderComponent(
      <Formik<{ revision: string }>
        initialValues={{ revision: "" }}
        onSubmit={jest.fn()}
      >
        <RevisionField secretURI="secret:aabbccdd" modelUUID="abc123" />
      </Formik>,
      { state, path, url },
    );
    expect(
      screen.getByRole("option", { name: "2 (latest)" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("option", { name: "1" })).toBeInTheDocument();
  });
});
