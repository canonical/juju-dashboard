import { screen } from "@testing-library/react";

import { CredentialActionsLabel } from "components/CredentialActions";
import {
  credentialContentsStateFactory,
  jujuStateFactory,
  userCredentialsStateFactory,
} from "testing/factories/juju/juju";
import { rootStateFactory } from "testing/factories/root";
import { customWithin } from "testing/queries/within";
import { renderComponent } from "testing/utils";

import CredentialsTable from "./CredentialsTable";

describe("CredentialsTable", () => {
  const AWS_TAG = "cloudcred-aws_admin_default";
  const GCE_TAG = "cloudcred-gce_admin@external_secondary";

  it("renders a row for each credential using the matching contents", () => {
    const state = rootStateFactory.build({
      juju: jujuStateFactory.build({
        userCredentials: userCredentialsStateFactory.build({
          credentials: { "cloud-aws": [AWS_TAG], "cloud-gce": [GCE_TAG] },
        }),
        credentialContents: credentialContentsStateFactory.build({
          contents: {
            [AWS_TAG]: {
              result: {
                content: {
                  "auth-type": "access-key",
                  cloud: "aws",
                  name: "default",
                },
                models: [
                  { model: "model-one", access: "admin" },
                  { model: "model-two", access: "read" },
                ],
              },
            },
          },
        }),
      }),
    });
    renderComponent(<CredentialsTable />, { state });

    // The credential with contents shows its details.
    expect(screen.getByRole("row", { name: /default/ })).toHaveTextContent(
      /In use\s*default\s*aws\s*access-key\s*2/,
    );
    // The credential without contents falls back to defaults.
    expect(screen.getByRole("row", { name: /secondary/ })).toHaveTextContent(
      /Not in use\s*secondary\s*gce\s*-\s*0/,
    );
  });

  it("only renders the credentials matching the filters", () => {
    const state = rootStateFactory.build({
      juju: jujuStateFactory.build({
        userCredentials: userCredentialsStateFactory.build({
          credentials: { "cloud-aws": [AWS_TAG], "cloud-gce": [GCE_TAG] },
        }),
      }),
    });
    renderComponent(<CredentialsTable filters={{ cloud: ["gce"] }} />, {
      state,
    });

    expect(screen.getByRole("cell", { name: "secondary" })).toBeInTheDocument();
    expect(
      screen.queryByRole("cell", { name: "default" }),
    ).not.toBeInTheDocument();
  });

  it("renders the actions menu in each row", () => {
    const state = rootStateFactory.build({
      juju: jujuStateFactory.build({
        userCredentials: userCredentialsStateFactory.build({
          credentials: { "cloud-aws": [AWS_TAG], "cloud-gce": [GCE_TAG] },
        }),
      }),
    });
    renderComponent(<CredentialsTable />, { state });

    expect(
      customWithin(screen.getByRole("row", { name: /default/ })).getByRole(
        "button",
        { name: CredentialActionsLabel.TOGGLE },
      ),
    ).toBeInTheDocument();
    expect(
      customWithin(screen.getByRole("row", { name: /secondary/ })).getByRole(
        "button",
        { name: CredentialActionsLabel.TOGGLE },
      ),
    ).toBeInTheDocument();
  });

  it.each([
    ["there are no credentials", {}, "No credentials"],
    [
      "user credentials are loading",
      { userCredentials: userCredentialsStateFactory.build({ loading: true }) },
      "Loading credentials...",
    ],
    [
      "credential contents are loading",
      {
        credentialContents: credentialContentsStateFactory.build({
          loading: true,
        }),
      },
      "Loading credentials...",
    ],
  ])("renders a message when %s", (_scenario, juju, message) => {
    const state = rootStateFactory.build({
      juju: jujuStateFactory.build(juju),
    });
    renderComponent(<CredentialsTable />, { state });
    expect(screen.getByText(message)).toBeInTheDocument();
  });
});
