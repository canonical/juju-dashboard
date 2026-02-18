import { screen } from "@testing-library/react";
import { Formik } from "formik";
import { vi } from "vitest";

import type { RootState } from "store/store";
import { rootStateFactory } from "testing/factories";
import {
  configFactory,
  generalStateFactory,
  credentialFactory,
} from "testing/factories/general";
import {
  listSecretResultFactory,
  secretRevisionFactory,
} from "testing/factories/juju/SecretsV2";
import {
  modelListInfoFactory,
  secretsStateFactory,
  modelSecretsFactory,
} from "testing/factories/juju/juju";
import { renderComponent } from "testing/utils";
import urls from "urls";

import RevisionField from "./RevisionField";

vi.mock("components/utils", async () => {
  const utils = await vi.importActual("components/utils");
  return {
    ...utils,
    copyToClipboard: vi.fn(),
  };
});

describe("RevisionField", () => {
  let state: RootState;
  const path = urls.model.index(null);
  const url = urls.model.index({
    qualifier: "eggman@external",
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
        onSubmit={vi.fn()}
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

  it("does not list revisions if they are empty", async () => {
    renderComponent(
      <Formik<{ revision: string }>
        initialValues={{ revision: "" }}
        onSubmit={vi.fn()}
      >
        <RevisionField secretURI="secret:another-secret" modelUUID="abc123" />
      </Formik>,
      { state, path, url },
    );
    expect(screen.queryAllByRole("option")).toStrictEqual([]);
  });
});
