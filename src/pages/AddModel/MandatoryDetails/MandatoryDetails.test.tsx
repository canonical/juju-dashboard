import { waitFor } from "@testing-library/react";
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
});
