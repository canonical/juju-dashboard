import type { Mock } from "vitest";

import { Auth } from "./Auth";
import { LocalAuth } from "./LocalAuth";

describe("LocalAuth", () => {
  let dispatch: Mock;

  beforeEach(() => {
    dispatch = vi.fn();
    new LocalAuth(dispatch);
  });

  afterEach(() => {
    // @ts-expect-error - Resetting singleton for each test run.
    delete Auth.instance;
  });

  describe("determineCredentials", () => {
    it("no credential", () => {
      expect(Auth.instance.determineCredentials()).toBeUndefined();
    });

    it("provided credentials", () => {
      expect(
        Auth.instance.determineCredentials({
          user: "some-user",
          password: "some-password",
        }),
      ).toEqual({
        username: "some-user",
        password: "some-password",
      });
    });
  });
});
