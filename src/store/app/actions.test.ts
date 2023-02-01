import {
  updatePermissions,
  connectAndPollControllers,
  ControllerArgs,
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
      { user: "eggman@external", password: "verysecure123" },
      false,
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
});
