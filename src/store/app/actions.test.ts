import { NotificationSeverity } from "@canonical/react-components";

import type { ControllerArgs } from "./actions";
import {
  updatePermissions,
  connectAndPollControllers,
  createToast,
} from "./actions";

describe("actions", () => {
  it("updatePermissions", () => {
    const args = {
      action: "grant",
      modelUUID: "abc123",
      permissionFrom: "read",
      permissionTo: "write",
      user: "admin",
      wsControllerURL: "wss://example.com",
    };
    expect(updatePermissions(args)).toStrictEqual({
      type: "app/updatePermissions",
      payload: args,
    });
  });

  it("connectAndPollControllers", () => {
    const controller: ControllerArgs = [
      "wss://example.com",
      { user: "eggman@external", password: "verySecure123" },
    ];
    const args = {
      controllers: [controller],
      isJuju: true,
    };
    expect(connectAndPollControllers(args)).toStrictEqual({
      type: "app/connectAndPollControllers",
      payload: args,
    });
  });

  it("createToast", () => {
    const args = {
      message: "Boo!",
      severity: NotificationSeverity.CAUTION,
    };
    expect(createToast(args)).toStrictEqual({
      type: "app/createToast",
      payload: args,
    });
  });
});
