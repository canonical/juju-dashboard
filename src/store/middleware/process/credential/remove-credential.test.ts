import { actions as jujuActions } from "store/juju";
import type { ManagedConnection } from "store/middleware/connection/connection-manager";

import removeCredentialProcess, {
  Label,
  runRemoveCredential,
} from "./remove-credential";

const credentialTag = "cloudcred-aws_eggman@external_my-cred";

describe("runRemoveCredential", () => {
  let connection: ManagedConnection;
  let setCloudFacade: (
    revokeCredentialsCheckModels: ReturnType<typeof vi.fn>,
  ) => void;

  beforeEach(() => {
    connection = { facades: {} } as ManagedConnection;
    setCloudFacade = (revokeCredentialsCheckModels): void => {
      (connection.facades as Record<string, unknown>).cloud = {
        revokeCredentialsCheckModels,
      };
    };
    setCloudFacade(vi.fn());
  });

  it("revokes the credential without force and yields pending", async ({
    expect,
  }) => {
    expect.assertions(3);
    const revokeCredentialsCheckModels = vi
      .fn()
      .mockResolvedValue({ results: [{}] });
    setCloudFacade(revokeCredentialsCheckModels);
    const progress = runRemoveCredential(credentialTag, connection);

    await expect(progress.next()).resolves.toEqual({
      done: false,
      value: { status: "pending" },
    });
    await expect(progress.next()).resolves.toEqual({
      done: true,
      value: undefined,
    });

    expect(revokeCredentialsCheckModels).toHaveBeenCalledExactlyOnceWith({
      credentials: [{ tag: credentialTag, force: false }],
    });
  });

  it("throws an error when revokeCredentialsCheckModels rejects", async ({
    expect,
  }) => {
    expect.assertions(2);
    setCloudFacade(vi.fn().mockRejectedValue(new Error("boom")));
    const progress = runRemoveCredential(credentialTag, connection);

    await expect(progress.next()).resolves.toEqual({
      done: false,
      value: { status: "pending" },
    });
    await expect(progress.next()).rejects.toThrowError("boom");
  });

  it("throws an Error with the server's message", async ({ expect }) => {
    expect.assertions(3);
    setCloudFacade(
      vi.fn().mockResolvedValue({
        results: [
          { error: { code: "", message: "credential is used by 1 model" } },
        ],
      }),
    );
    const progress = runRemoveCredential(credentialTag, connection);

    await expect(progress.next()).resolves.toEqual({
      done: false,
      value: { status: "pending" },
    });
    const next = progress.next();
    await expect(next).rejects.toBeInstanceOf(Error);
    await expect(next).rejects.toThrowError("credential is used by 1 model");
  });

  it("throws an error when cloud facade is missing", async ({ expect }) => {
    expect.assertions(1);
    connection.facades = {};
    const progress = runRemoveCredential(credentialTag, connection);

    await expect(progress.next()).rejects.toThrowError(
      Label.NO_CLOUD_FACADE_ERROR,
    );
  });
});

describe("process", () => {
  it("stores an error when the connection is missing", async ({ expect }) => {
    const dispatch = vi.fn();
    const payload = { wsControllerURL: "wss://example.com/api", credentialTag };

    await removeCredentialProcess.start({ ...payload, meta: {} }, dispatch);

    expect(dispatch.mock.calls).toEqual([
      [jujuActions.setRemoveCredentialRunning({ ...payload, running: true })],
      [
        jujuActions.setRemoveCredentialOutcome({
          ...payload,
          outcome: {
            error: {
              message: Label.MISSING_CONNECTION_ERROR,
              source: new Error(Label.MISSING_CONNECTION_ERROR),
            },
          },
        }),
      ],
      [jujuActions.setRemoveCredentialRunning({ ...payload, running: false })],
    ]);
  });
});

describe("action", () => {
  it("contains meta properties", ({ expect }) => {
    const action = removeCredentialProcess.actions.run({
      wsControllerURL: "wss://example.com/api",
      credentialTag,
    });

    expect(action).toEqual(
      expect.objectContaining({
        meta: {
          withConnection: true,
          connectionList: ["wsControllerURL"],
        },
      }),
    );
  });
});
