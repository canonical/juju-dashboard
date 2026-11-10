import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import type { RootState } from "store/store";
import { configFactory, generalStateFactory } from "testing/factories/general";
import {
  cloudInfoStateFactory,
  jujuStateFactory,
  userCredentialsStateFactory,
} from "testing/factories/juju/juju";
import { rootStateFactory } from "testing/factories/root";
import { renderComponent } from "testing/utils";

import CredentialsIndex from "./CredentialsIndex";

describe("CredentialsIndex", () => {
  const WS_URL = "wss://controller.example.com";
  const AWS_TAG = "cloudcred-aws_admin_default";
  const GCE_TAG = "cloudcred-gce_admin_secondary";
  let state: RootState;

  beforeEach(() => {
    state = rootStateFactory.build({
      general: generalStateFactory.build({
        config: configFactory.build({ controllerAPIEndpoint: WS_URL }),
        controllerConnections: {
          [WS_URL]: { user: { identity: "user-eggman@external" } },
        },
      }),
      juju: jujuStateFactory.build({
        cloudInfo: cloudInfoStateFactory.build({
          clouds: {
            "cloud-aws": { type: "ec2" },
            "cloud-gce": { type: "gce" },
          },
        }),
        userCredentials: userCredentialsStateFactory.build({
          credentials: { "cloud-aws": [AWS_TAG], "cloud-gce": [GCE_TAG] },
        }),
      }),
    });
  });

  it("renders the credentials count and table", () => {
    renderComponent(<CredentialsIndex />, { state });

    expect(screen.getByText(/2 credentials/)).toBeInTheDocument();
    expect(screen.getByRole("table")).toBeInTheDocument();
    expect(screen.getAllByRole("row")).toHaveLength(3);
  });

  it.for([
    ["cloud", "gce", "secondary"],
    ["credential", "default", "default"],
    ["custom", "second", "secondary"],
  ] as const)(
    "can filter credentials via the URL (%s = %s)",
    ([param, value, name], { expect }) => {
      renderComponent(<CredentialsIndex />, {
        state,
        url: `?${new URLSearchParams({ [param]: value })}`,
      });

      // 1 credential + header
      expect(screen.getAllByRole("row")).toHaveLength(2);
      expect(screen.getByRole("cell", { name })).toBeInTheDocument();
    },
  );

  it("can change the filters", async () => {
    const { router } = renderComponent(<CredentialsIndex />, { state });
    // 2 credentials + header
    expect(screen.getAllByRole("row")).toHaveLength(3);

    await userEvent.click(
      screen.getByRole("searchbox", { name: "Search and filter" }),
    );
    await userEvent.click(screen.getByRole("button", { name: "CLOUD aws" }));

    // 1 credential + header
    expect(screen.getAllByRole("row")).toHaveLength(2);
    expect(screen.getByRole("cell", { name: "default" })).toBeInTheDocument();
    const params = new URLSearchParams(router.state.location.search);
    expect(params.get("cloud")).toBe("aws");
  });

  it("only offers filters for the cloud and credential name", async () => {
    renderComponent(<CredentialsIndex />, { state });

    await userEvent.click(
      screen.getByRole("searchbox", { name: "Search and filter" }),
    );

    expect(
      screen.getByRole("button", { name: "CLOUD aws" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "CLOUD gce" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "CREDENTIAL secondary" }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: /^(REGION|OWNER)/ }),
    ).not.toBeInTheDocument();
  });

  it("refreshes the window from the error notification", async () => {
    const { location } = window;
    Object.defineProperty(window, "location", {
      value: { ...location, reload: vi.fn() },
    });

    state.juju.credentialContents.errors = {
      source: "credential-contents",
      message: "Uh oh!",
    };
    renderComponent(<CredentialsIndex />, { state });
    await userEvent.click(screen.getByRole("button", { name: "refreshing" }));
    expect(window.location.reload).toHaveBeenCalled();

    Object.defineProperty(window, "location", {
      value: location,
    });
  });
});
