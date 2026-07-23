import type { Mock } from "vitest";

import { Label } from "juju/jimm/api";
import type { ManagedConnection } from "store/middleware/connection/connection-manager";
import { modelControllerInfoFactory } from "testing/factories/juju/jimm";

import { getModelControllerInfo } from "./model-controller-info";

describe("createModelControllerInfoSource", () => {
  let connection: ManagedConnection;
  let modelControllerInfoMock: Mock;

  beforeEach(() => {
    modelControllerInfoMock = vi
      .fn()
      .mockResolvedValue(modelControllerInfoFactory.build());
    connection = {
      facades: {
        jimM: {
          modelControllerInfo: modelControllerInfoMock,
        },
      },
    } as unknown as ManagedConnection;
  });

  it("calls `modelControllerInfo` method on provided connection", async ({
    expect,
  }) => {
    const tryConnection = getModelControllerInfo(connection, "abc123");
    expect(modelControllerInfoMock).not.toHaveBeenCalled();

    await expect(tryConnection()).resolves.toEqual(
      modelControllerInfoFactory.build(),
    );
    expect(modelControllerInfoMock).toHaveBeenCalledExactlyOnceWith("abc123");
  });

  it("throws error if `jimM` facade isn't present", async ({ expect }) => {
    delete connection.facades.jimM;

    const tryConnection = getModelControllerInfo(connection, "abc123");
    await expect(tryConnection()).rejects.toThrow(Label.NO_JIMM);
  });
});
