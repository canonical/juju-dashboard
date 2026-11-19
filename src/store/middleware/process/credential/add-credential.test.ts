import type { MockInstance } from "vitest";

import type { ConnectionWithFacades } from "juju/types";
import { actions as jujuActions } from "store/juju";
import { authUserInfoFactory } from "testing/factories/general";
import { logger } from "utils/logger";

import * as connectionUtil from "../../connection/util";

import addCredentialProcess, { addCredential, Label } from "./add-credential";
import type { Payload } from "./add-credential";

const params = {
  cloud: "aws",
  name: "my-cred",
  authType: "access-key",
  attrs: { cloud: "cloud-aws", region: "us-east-1" },
};

describe("addCredential", () => {
  let connection: ConnectionWithFacades;
  let addCredentials: MockInstance;

  beforeEach(() => {
    addCredentials = vi.fn().mockResolvedValue({ results: [{}] });
    connection = {
      info: { user: authUserInfoFactory.build({ identity: "user-admin" }) },
      facades: { cloud: { addCredentials } },
    } as unknown as ConnectionWithFacades;
  });

  it("yields pending then completes", async ({ expect }) => {
    const progress = addCredential(params, connection);

    await expect(progress.next()).resolves.toEqual({
      done: false,
      value: { status: "pending" },
    });
    await expect(progress.next()).resolves.toEqual({
      done: true,
      value: undefined,
    });
  });

  it("adds the credential with the generated tag", async ({ expect }) => {
    const progress = addCredential(params, connection);
    await progress.next();

    expect(addCredentials).toHaveBeenCalledExactlyOnceWith({
      credentials: [
        {
          tag: "cloudcred-aws_admin_my-cred",
          credential: {
            "auth-type": "access-key",
            attrs: params.attrs,
          },
        },
      ],
    });
  });

  it("throws if not authenticated", async ({ expect }) => {
    connection.info.user = undefined;
    await expect(addCredential(params, connection).next()).rejects.toThrowError(
      Label.NOT_AUTHENTICATED_ERROR,
    );
    expect(addCredentials).not.toHaveBeenCalled();
  });

  it("throws if the cloud facade is not available", async ({ expect }) => {
    connection.facades = {};
    await expect(addCredential(params, connection).next()).rejects.toThrowError(
      Label.NO_CLOUD_FACADE_ERROR,
    );
  });

  it("throws if the request rejects", async ({ expect }) => {
    addCredentials.mockRejectedValue(new Error("boom"));
    const progress = addCredential(params, connection);
    await progress.next();

    await expect(progress.next()).rejects.toThrowError("boom");
  });

  it("throws if the result contains an error", async ({ expect }) => {
    addCredentials.mockResolvedValue({
      results: [{ error: { message: "already exists" } }],
    });
    const progress = addCredential(params, connection);
    await progress.next();

    await expect(progress.next()).rejects.toThrowError("already exists");
  });
});

describe("process", () => {
  const payload: Payload = {
    wsControllerURL: "wss://example.com/api",
    ...params,
  };
  let addCredentials: MockInstance;
  let dispatch: MockInstance;
  let meta: Record<string, unknown>;

  beforeEach(() => {
    vi.spyOn(connectionUtil, "hasConnections").mockReturnValue(true);
    addCredentials = vi.fn().mockResolvedValue({ results: [{}] });
    dispatch = vi.fn();
    meta = {
      connections: {
        wsControllerURL: {
          info: { user: authUserInfoFactory.build({ identity: "user-admin" }) },
          facades: { cloud: { addCredentials } },
        },
      },
    };
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("stores the outcome", async ({ expect }) => {
    const { wsControllerURL } = payload;
    await addCredentialProcess.start({ ...payload, meta }, dispatch as never);
    expect(dispatch.mock.calls.map(([action]) => action)).toStrictEqual([
      jujuActions.setAddCredentialRunning({
        wsControllerURL,
        cloud: "aws",
        name: "my-cred",
        running: true,
      }),
      jujuActions.setAddCredentialOutcome({
        wsControllerURL,
        cloud: "aws",
        name: "my-cred",
        outcome: { result: undefined },
      }),
      jujuActions.setAddCredentialRunning({
        wsControllerURL,
        cloud: "aws",
        name: "my-cred",
        running: false,
      }),
    ]);
  });

  it("stores the error outcome if the request fails", async ({ expect }) => {
    const error = vi.spyOn(logger, "error").mockImplementation(() => undefined);
    addCredentials.mockResolvedValue({
      results: [{ error: { message: "already exists" } }],
    });
    const { wsControllerURL } = payload;
    await addCredentialProcess.start({ ...payload, meta }, dispatch as never);
    expect(dispatch).toHaveBeenCalledWith(
      jujuActions.setAddCredentialOutcome({
        wsControllerURL,
        cloud: "aws",
        name: "my-cred",
        outcome: {
          error: {
            message: "already exists",
            source: new Error("already exists"),
          },
        },
      }),
    );
    expect(error).toHaveBeenCalledExactlyOnceWith(
      "Unable to add credential",
      "my-cred",
      expect.objectContaining({ message: "already exists" }),
    );
  });

  it("stores an error when the connection is missing", async ({ expect }) => {
    vi.spyOn(connectionUtil, "hasConnections").mockReturnValue(false);
    vi.spyOn(logger, "error").mockImplementation(() => undefined);
    const { wsControllerURL } = payload;
    await addCredentialProcess.start(
      { ...payload, meta: {} },
      dispatch as never,
    );
    expect(dispatch).toHaveBeenCalledWith(
      jujuActions.setAddCredentialOutcome({
        wsControllerURL,
        cloud: "aws",
        name: "my-cred",
        outcome: {
          error: {
            message: Label.MISSING_CONNECTION_ERROR,
            source: new Error(Label.MISSING_CONNECTION_ERROR),
          },
        },
      }),
    );
    expect(addCredentials).not.toHaveBeenCalled();
  });

  it("logs the pending status", async ({ expect }) => {
    const debug = vi.spyOn(logger, "debug").mockImplementation(() => undefined);
    await addCredentialProcess.start({ ...payload, meta }, dispatch as never);
    expect(debug).toHaveBeenCalledExactlyOnceWith(
      'Adding credential "my-cred" to aws: pending',
    );
  });
});

describe("action", () => {
  it("contains meta properties", ({ expect }) => {
    const action = addCredentialProcess.actions.run({
      wsControllerURL: "wss://example.com/api",
      ...params,
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
