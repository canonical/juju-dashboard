import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Formik } from "formik";
import * as Yup from "yup";

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

import type { AddModelFormState } from "../types";

import MandatoryDetails from "./MandatoryDetails";

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
          credentials: [
            "cloudcred-aws_admin_aws-cred",
            "cloudcred-gce_user_gce-cred",
          ],
          loaded: true,
        }),
      }),
    });
  });

  const renderWithFormik = (initialValues: AddModelFormState): void => {
    const validationSchema = Yup.object().shape({
      modelName: Yup.string().required(),
      cloud: Yup.string().required(),
      region: Yup.string(),
      credential: Yup.string().required(),
    });

    renderComponent(
      <Formik
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={vi.fn()}
      >
        <MandatoryDetails />
      </Formik>,
      { state },
    );
  };

  it("renders properly with defaults", () => {
    renderWithFormik({
      modelName: "",
      cloud: "",
      region: "",
      credential: "",
    });

    expect(screen.getByLabelText(/Model name/)).toHaveValue("");
    expect(screen.getByLabelText("Cloud")).toHaveValue("cloud-aws");
    expect(screen.getByLabelText("Region (optional)")).toHaveValue("");
    expect(screen.getByLabelText("Credential")).toHaveValue("aws-cred");
  });

  it("renders saved form values", () => {
    renderWithFormik({
      modelName: "my-model",
      cloud: "cloud-gce",
      region: "europe-west1",
      credential: "gce-cred",
    });

    expect(screen.getByLabelText(/Model name/)).toHaveValue("my-model");
    expect(screen.getByLabelText("Cloud")).toHaveValue("cloud-gce");
    expect(screen.getByLabelText("Region (optional)")).toHaveValue(
      "europe-west1",
    );
    expect(screen.getByLabelText("Credential")).toHaveValue("gce-cred");
  });

  it("fetches credentials on initial load when cloud is set", async () => {
    const [store, actions] = createStore(state, { trackActions: true });
    const validationSchema = Yup.object().shape({
      modelName: Yup.string().required(),
      cloud: Yup.string().required(),
      region: Yup.string(),
      credential: Yup.string().required(),
    });

    renderComponent(
      <Formik
        initialValues={{
          modelName: "",
          cloud: "cloud-aws",
          region: "",
          credential: "",
        }}
        validationSchema={validationSchema}
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

  it("changes region options and fetches credentials when cloud changes", async () => {
    const [store, actions] = createStore(state, { trackActions: true });
    const validationSchema = Yup.object().shape({
      modelName: Yup.string().required(),
      cloud: Yup.string().required(),
      region: Yup.string(),
      credential: Yup.string().required(),
    });

    renderComponent(
      <Formik
        initialValues={{
          modelName: "my-model",
          cloud: "cloud-gce",
          region: "europe-west1",
          credential: "gce-cred",
        }}
        validationSchema={validationSchema}
        onSubmit={vi.fn()}
      >
        <MandatoryDetails />
      </Formik>,
      { store },
    );

    expect(screen.getByLabelText("Cloud")).toHaveValue("cloud-gce");
    expect(screen.getByLabelText("Region (optional)")).toHaveValue(
      "europe-west1",
    );

    await userEvent.selectOptions(screen.getByLabelText("Cloud"), "cloud-aws");
    await waitFor(() => {
      expect(
        actions.find(
          (dispatch) => dispatch.type === jujuActions.fetchUserCredentials.type,
        ),
      ).toMatchObject(
        jujuActions.fetchUserCredentials({
          wsControllerURL: "wss://controller.example.com",
          userTag: "user-eggman@external",
          cloudTag: "cloud-aws",
        }),
      );
    });
    expect(screen.getByLabelText("Region (optional)")).toHaveValue("");
  });
});
