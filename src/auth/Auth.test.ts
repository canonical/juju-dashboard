import { Auth, AuthMethod } from ".";

describe("Auth base class", () => {
  beforeEach(() => {
    // @ts-expect-error - Resetting singleton for each test run.
    delete Auth.instance;
  });

  it("creates new singleton instance", () => {
    expect(Auth.instance).not.toBeDefined();
    const instance = new Auth(vi.fn(), AuthMethod.LOCAL);
    expect(Auth.instance).to.equal(instance);
  });

  it("overrides singleton instance", () => {
    const instance1 = new Auth(vi.fn(), AuthMethod.LOCAL);
    const instance2 = new Auth(vi.fn(), AuthMethod.LOCAL);
    expect(Auth.instance).not.to.equal(instance1);
    expect(Auth.instance).to.equal(instance2);
  });

  it("continues controller connection by default", async () => {
    const instance = new Auth(vi.fn(), AuthMethod.LOCAL);
    await expect(
      instance.beforeControllerConnect({
        wsControllerURL: "wss://1.2.3.4/api",
      }),
    ).resolves.to.equal(true);
  });
});
