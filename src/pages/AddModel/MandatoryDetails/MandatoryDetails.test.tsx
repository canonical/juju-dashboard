import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Formik } from "formik";

import { actions as jujuActions } from "store/juju";
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
          loaded: true,
        }),
        userCredentials: userCredentialsStateFactory.build({
          credentials: {
            "cloud-aws": ["cloudcred-aws_admin_aws-cred"],
            "cloud-gce": ["cloudcred-gce_user_gce-cred"],
          },
          loaded: true,
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
    expect(screen.getByLabelText(Label.CREDENTIAL)).toHaveValue("aws-cred");
  });

  it("renders saved form values", () => {
    renderComponent(
      <Formik
        initialValues={{
          modelName: "my-model",
          cloud: "cloud-gce",
          region: "europe-west1",
          credential: "gce-cred",
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
    expect(screen.getByLabelText(Label.CREDENTIAL)).toHaveValue("gce-cred");
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

    const action = jujuActions.fetchUserCredentials({
      wsControllerURL: "wss://controller.example.com",
      userTag: "user-eggman@external",
      cloudTag: "cloud-aws",
    });

    await waitFor(() => {
      expect(
        actions.find((dispatch) => dispatch.type === action.type),
      ).toMatchObject(action);
    });
  });

  it("fetches credentials on cloud change if they are not already loaded", async () => {
    state.juju.userCredentials = userCredentialsStateFactory.build({
      credentials: {
        "cloud-gce": ["cloudcred-gce_user_gce-cred"],
      },
      loaded: true,
    });
    const [store, actions] = createStore(state, { trackActions: true });
    renderComponent(
      <Formik
        initialValues={{
          modelName: "my-model",
          cloud: "cloud-gce",
          region: "europe-west1",
          credential: "gce-cred",
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

    const action = jujuActions.fetchUserCredentials({
      wsControllerURL: "wss://controller.example.com",
      userTag: "user-eggman@external",
      cloudTag: "cloud-aws",
    });

    await waitFor(() => {
      expect(
        actions.find((dispatch) => dispatch.type === action.type),
      ).toMatchObject(action);
    });
  });

  it("changes region and credential options when cloud changes", async () => {
    renderComponent(
      <Formik
        initialValues={{
          modelName: "my-model",
          cloud: "cloud-gce",
          region: "europe-west1",
          credential: "gce-cred",
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
    expect(screen.getByLabelText(Label.CREDENTIAL)).toHaveValue("aws-cred");
  });
});
