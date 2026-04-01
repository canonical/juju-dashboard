import { act, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { FormikProps } from "formik";
import { createRef } from "react";

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
  let initialValues: AddModelFormState | null;
  const onSubmit = vi.fn();
  const formRef = createRef<FormikProps<AddModelFormState>>();
  const props = {
    onSubmit,
    formRef,
    initialValues: null,
  };

  beforeEach(() => {
    initialValues = null;
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

  it("renders properly with defaults", () => {
    renderComponent(<MandatoryDetails {...props} />, { state });

    expect(screen.getByLabelText("Model name")).toHaveValue("");
    expect(screen.getByLabelText("Cloud")).toHaveValue("cloud-aws");
    expect(screen.getByLabelText("Region (optional)")).toHaveValue("");
    expect(screen.getByLabelText("Credential")).toHaveValue("aws-cred");
  });

  it("renders saved form values", () => {
    initialValues = {
      modelName: "my-model",
      cloud: "cloud-gce",
      region: "europe-west1",
      credential: "gce-cred",
    };

    renderComponent(
      <MandatoryDetails {...props} initialValues={initialValues} />,
      {
        state,
      },
    );

    expect(screen.getByLabelText("Model name")).toHaveValue("my-model");
    expect(screen.getByLabelText("Cloud")).toHaveValue("cloud-gce");
    expect(screen.getByLabelText("Region (optional)")).toHaveValue(
      "europe-west1",
    );
    expect(screen.getByLabelText("Credential")).toHaveValue("gce-cred");
  });

  it("fetches credentials on initial load when there is no saved draft", async () => {
    const [store, actions] = createStore(state, { trackActions: true });
    renderComponent(<MandatoryDetails {...props} />, { store });

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
    initialValues = {
      modelName: "my-model",
      cloud: "cloud-gce",
      region: "europe-west1",
      credential: "gce-cred",
    };
    const [store, actions] = createStore(state, { trackActions: true });
    renderComponent(
      <MandatoryDetails {...props} initialValues={initialValues} />,
      {
        store,
      },
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

  it("calls onSubmit callback when the form is submitted", async () => {
    renderComponent(<MandatoryDetails {...props} />, {
      state,
    });

    await userEvent.type(screen.getByLabelText("Model name"), "my-model");
    await userEvent.selectOptions(
      screen.getByLabelText("Credential"),
      "aws-cred",
    );

    await act(async () => {
      await formRef.current?.submitForm();
    });

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledTimes(1);
    });
  });
});
