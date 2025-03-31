import { configFactory } from "testing/factories/general";

import { initialiseAuthFromConfig } from "./utils";

import { Auth, CandidAuth, OIDCAuth, LocalAuth } from ".";

describe("initialiseAuthFromConfig", () => {
  it("detects OIDC", () => {
    const config = configFactory.build({ isJuju: false });
    initialiseAuthFromConfig(config, vi.fn());
    expect(Auth.instance).toBeInstanceOf(OIDCAuth);
  });

  it("detects candid", () => {
    const config = configFactory.build({
      isJuju: true,
      identityProviderURL: "/candid",
    });
    initialiseAuthFromConfig(config, vi.fn());
    expect(Auth.instance).toBeInstanceOf(CandidAuth);
  });

  it("detects local", () => {
    const config = configFactory.build({ isJuju: true });
    initialiseAuthFromConfig(config, vi.fn());
    expect(Auth.instance).toBeInstanceOf(LocalAuth);
  });
});
