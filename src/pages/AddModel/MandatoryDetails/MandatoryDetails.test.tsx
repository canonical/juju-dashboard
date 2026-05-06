import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Formik } from "formik";

import type { RootState } from "store/store";
import { generalStateFactory, configFactory } from "testing/factories/general";
import {
  jujuStateFactory,
  cloudInfoStateFactory,
  userCredentialsStateFactory,
} from "testing/factories/juju/juju";
import { rootStateFactory } from "testing/factories/root";
import { createStore, renderComponent } from "testing/utils";

import MandatoryDetails from "./MandatoryDetails";
import { Label } from "./types";

describe("MandatoryDetails", () => {
  let state: RootState;

  beforeEach(() => {
    state = rootStateFactory.withGeneralConfig().build({
      general: generalStateFactory.build({
        config: configFactory.build({
          controllerAPIEndpoint: "wss://controller.example.com",
          isJuju: true,
        }),
        controllerConnections: {
          "wss://controller.example.com": {
            user: {
              identity: "user-eggman@external",
            },
          },
        },
      }),
      juju: jujuStateFactory.build({
        cloudInfo: cloudInfoStateFactory.build({
          clouds: {
            "cloud-aws": {
              regions: [{ name: "us-east-1" }, { name: "us-west-2" }],
              type: "ec2",
            },
            "cloud-gce": {
              regions: [{ name: "europe-west1" }],
              type: "gce",
            },
          },
        }),
        userCredentials: userCredentialsStateFactory.build({
          credentials: {
            "cloud-aws": ["cloudcred-aws_admin_aws-cred"],
            "cloud-gce": ["cloudcred-gce_user_gce-cred"],
          },
        }),
      }),
    });
  });

  it("renders properly with defaults", () => {
    renderComponent(
      <Formik
        initialValues={{
          modelName: "",
          cloud: "",
          region: "",
          credential: "",
        }}
        onSubmit={vi.fn()}
      >
        <MandatoryDetails />
      </Formik>,
      { state },
    );

    expect(screen.getByLabelText(new RegExp(Label.MODEL_NAME))).toHaveValue("");
    expect(screen.getByLabelText(Label.CLOUD)).toHaveValue("cloud-aws");
    expect(screen.getByLabelText(Label.REGION)).toHaveValue("");
    expect(screen.getByLabelText(Label.CREDENTIAL)).toHaveValue(
      "cloudcred-aws_admin_aws-cred",
    );
  });

  it("renders saved form values", () => {
    renderComponent(
      <Formik
        initialValues={{
          modelName: "my-model",
          cloud: "cloud-gce",
          region: "europe-west1",
          credential: "cloudcred-gce_user_gce-cred",
        }}
        onSubmit={vi.fn()}
      >
        <MandatoryDetails />
      </Formik>,
      { state },
    );
    expect(screen.getByLabelText(new RegExp(Label.MODEL_NAME))).toHaveValue(
      "my-model",
    );
    expect(screen.getByLabelText(Label.CLOUD)).toHaveValue("cloud-gce");
    expect(screen.getByLabelText(Label.REGION)).toHaveValue("europe-west1");
    expect(screen.getByLabelText(Label.CREDENTIAL)).toHaveValue(
      "cloudcred-gce_user_gce-cred",
    );
  });

  it("does not overwrite an existing credential", () => {
    state.juju.userCredentials = userCredentialsStateFactory.build({
      credentials: {
        "cloud-aws": [
          "cloudcred-aws_admin_aws-cred",
          "cloudcred-aws_user_secondary-cred",
        ],
      },
    });

    renderComponent(
      <Formik
        initialValues={{
          modelName: "",
          cloud: "cloud-aws",
          region: "",
          credential: "cloudcred-aws_user_secondary-cred",
        }}
        onSubmit={vi.fn()}
      >
        <MandatoryDetails />
      </Formik>,
      { state },
    );

    expect(screen.getByLabelText(Label.CREDENTIAL)).toHaveValue(
      "cloudcred-aws_user_secondary-cred",
    );
  });

  it("fetches credentials on initial load when cloud is set", async () => {
    state.juju.userCredentials = userCredentialsStateFactory.build();
    const [store, actions] = createStore(state, { trackActions: true });
    renderComponent(
      <Formik
        initialValues={{
          modelName: "",
          cloud: "cloud-aws",
          region: "",
          credential: "",
        }}
        onSubmit={vi.fn()}
      >
        <MandatoryDetails />
      </Formik>,
      { store },
    );

    await waitFor(() => {
      expect(
        actions.find(
          (dispatch) => dispatch.type === "source/user-credentials/start",
        ),
      ).toMatchObject({
        payload: {
          wsControllerURL: "wss://controller.example.com",
          cloudTag: "cloud-aws",
        },
      });
    });
  });

  it("fetches credentials on cloud change if they are not already loaded", async () => {
    state.juju.userCredentials = userCredentialsStateFactory.build({
      credentials: {
        "cloud-gce": ["cloudcred-gce_user_gce-cred"],
      },
    });
    const [store, actions] = createStore(state, { trackActions: true });
    renderComponent(
      <Formik
        initialValues={{
          modelName: "my-model",
          cloud: "cloud-gce",
          region: "europe-west1",
          credential: "cloudcred-gce_user_gce-cred",
        }}
        onSubmit={vi.fn()}
      >
        <MandatoryDetails />
      </Formik>,
      { store },
    );

    expect(screen.getByLabelText(Label.CLOUD)).toHaveValue("cloud-gce");
    expect(screen.getByLabelText(Label.REGION)).toHaveValue("europe-west1");

    await userEvent.selectOptions(
      screen.getByLabelText(Label.CLOUD),
      "cloud-aws",
    );

    await waitFor(() => {
      expect(
        actions.find(
          (dispatch) => dispatch.type === "source/user-credentials/start",
        ),
      ).toMatchObject({
        payload: {
          wsControllerURL: "wss://controller.example.com",
          cloudTag: "cloud-aws",
        },
      });
    });
  });

  it("stops credential updates on unmount", async () => {
    const [store, actions] = createStore(state, { trackActions: true });
    const { result } = renderComponent(
      <Formik
        initialValues={{
          modelName: "my-model",
          cloud: "cloud-gce",
          region: "europe-west1",
          credential: "cloudcred-gce_user_gce-cred",
        }}
        onSubmit={vi.fn()}
      >
        <MandatoryDetails />
      </Formik>,
      { store },
    );

    result.unmount();

    await waitFor(() => {
      expect(
        actions.find(
          (dispatch) => dispatch.type === "source/user-credentials/stop",
        ),
      ).toMatchObject({
        payload: {
          wsControllerURL: "wss://controller.example.com",
          cloudTag: "cloud-gce",
        },
      });
    });
  });

  it("changes region and credential options when cloud changes", async () => {
    renderComponent(
      <Formik
        initialValues={{
          modelName: "my-model",
          cloud: "cloud-gce",
          region: "europe-west1",
          credential: "cloudcred-gce_user_gce-cred",
        }}
        onSubmit={vi.fn()}
      >
        <MandatoryDetails />
      </Formik>,
      { state },
    );

    expect(screen.getByLabelText(Label.CLOUD)).toHaveValue("cloud-gce");
    expect(screen.getByLabelText(Label.REGION)).toHaveValue("europe-west1");

    await userEvent.selectOptions(
      screen.getByLabelText(Label.CLOUD),
      "cloud-aws",
    );
    expect(screen.getByLabelText(Label.REGION)).toHaveValue("");
    expect(screen.getByLabelText(Label.CREDENTIAL)).toHaveValue(
      "cloudcred-aws_admin_aws-cred",
    );
  });
});
