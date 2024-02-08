import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
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
} from "testing/factories/juju/juju";
import { renderComponent } from "testing/utils";
import urls from "urls";

import { secretRevisionFactory } from "../../../testing/factories/juju/juju";
import type { FormFields } from "../types";

import Fields, { Label } from "./Fields";

describe("Fields", () => {
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
      <Formik<FormFields>
        initialValues={{ removeAll: false, revision: "" }}
        onSubmit={jest.fn()}
      >
        <Fields
          secretURI="secret:aabbccdd"
          hideConfirm={jest.fn()}
          handleRemoveSecret={jest.fn()}
          showConfirm={false}
        />
      </Formik>,
      { state, path, url },
    );
    expect(
      screen.getByRole("option", { name: "2 (latest)" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("option", { name: "1" })).toBeInTheDocument();
  });

  it("can show a confirmation", async () => {
    renderComponent(
      <Formik<FormFields>
        initialValues={{ removeAll: false, revision: "" }}
        onSubmit={jest.fn()}
      >
        <Fields
          secretURI="secret:aabbccdd"
          hideConfirm={jest.fn()}
          handleRemoveSecret={jest.fn()}
          showConfirm={true}
        />
      </Formik>,
      { state, path, url },
    );
    expect(
      screen.getByRole("dialog", { name: Label.CONFIRM_TITLE }),
    ).toBeInTheDocument();
  });

  it("disables the revision field if the remove all checkbox is checked", async () => {
    const handleRemoveSecret = jest.fn();
    renderComponent(
      <Formik<FormFields>
        initialValues={{ removeAll: false, revision: "" }}
        onSubmit={jest.fn()}
      >
        <Fields
          secretURI="secret:aabbccdd"
          hideConfirm={jest.fn()}
          handleRemoveSecret={handleRemoveSecret}
          showConfirm={true}
        />
      </Formik>,
      { state, path, url },
    );
    await userEvent.click(
      screen.getByRole("checkbox", { name: Label.REMOVE_ALL }),
    );
    await userEvent.click(
      screen.getByRole("button", { name: Label.CONFIRM_BUTTON }),
    );
    expect(
      screen.getByRole("combobox", { name: Label.REVISION }),
    ).toBeDisabled();
  });

  it("displays a message if there is only one revision", async () => {
    state.juju.secrets.abc123 = modelSecretsFactory.build({
      items: [
        listSecretResultFactory.build({
          uri: "secret:aabbccdd",
          "latest-revision": 5,
          revisions: [secretRevisionFactory.build({ revision: 5 })],
        }),
      ],
      loaded: true,
    });
    const handleRemoveSecret = jest.fn();
    renderComponent(
      <Formik<FormFields>
        initialValues={{ removeAll: false, revision: "" }}
        onSubmit={jest.fn()}
      >
        <Fields
          secretURI="secret:aabbccdd"
          hideConfirm={jest.fn()}
          handleRemoveSecret={handleRemoveSecret}
          showConfirm={true}
        />
      </Formik>,
      { state, path, url },
    );
    expect(
      screen.queryByRole("checkbox", { name: Label.REMOVE_ALL }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("combobox", { name: Label.REVISION }),
    ).not.toBeInTheDocument();
    expect(
      screen.getByText(
        /This secret has one revision \(5\) and will be completely removed./,
      ),
    ).toBeInTheDocument();
  });

  it("can cancel the confirmation", async () => {
    const hideConfirm = jest.fn();
    renderComponent(
      <Formik<FormFields>
        initialValues={{ removeAll: false, revision: "" }}
        onSubmit={jest.fn()}
      >
        <Fields
          secretURI="secret:aabbccdd"
          hideConfirm={hideConfirm}
          handleRemoveSecret={jest.fn()}
          showConfirm={true}
        />
      </Formik>,
      { state, path, url },
    );
    await userEvent.selectOptions(
      screen.getByRole("combobox", { name: Label.REVISION }),
      "2 (latest)",
    );
    await userEvent.click(
      screen.getByRole("button", { name: Label.CANCEL_BUTTON }),
    );
    expect(hideConfirm).toHaveBeenCalled();
  });

  it("can confirm a revision and call the callback", async () => {
    const handleRemoveSecret = jest.fn();
    renderComponent(
      <Formik<FormFields>
        initialValues={{ removeAll: false, revision: "" }}
        onSubmit={jest.fn()}
      >
        <Fields
          secretURI="secret:aabbccdd"
          hideConfirm={jest.fn()}
          handleRemoveSecret={handleRemoveSecret}
          showConfirm={true}
        />
      </Formik>,
      { state, path, url },
    );
    await userEvent.selectOptions(
      screen.getByRole("combobox", { name: Label.REVISION }),
      "2 (latest)",
    );
    await userEvent.click(
      screen.getByRole("button", { name: Label.CONFIRM_BUTTON }),
    );
    expect(handleRemoveSecret).toHaveBeenCalledWith({
      removeAll: false,
      revision: "2",
    });
  });

  it("can confirm all revisions and call the callback", async () => {
    const handleRemoveSecret = jest.fn();
    renderComponent(
      <Formik<FormFields>
        initialValues={{ removeAll: false, revision: "" }}
        onSubmit={jest.fn()}
      >
        <Fields
          secretURI="secret:aabbccdd"
          hideConfirm={jest.fn()}
          handleRemoveSecret={handleRemoveSecret}
          showConfirm={true}
        />
      </Formik>,
      { state, path, url },
    );
    await userEvent.click(
      screen.getByRole("checkbox", { name: Label.REMOVE_ALL }),
    );
    await userEvent.click(
      screen.getByRole("button", { name: Label.CONFIRM_BUTTON }),
    );
    expect(handleRemoveSecret).toHaveBeenCalledWith({
      removeAll: true,
      revision: "",
    });
  });
});
