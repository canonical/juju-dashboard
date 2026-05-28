import type { Mock, MockInstance } from "vitest";

import type { Source } from "data";
import type { ManagedConnection } from "store/middleware/connection/connection-manager";

import * as modelConnectionRetrySourceModule from "./model-connection-retry-source";
import type { ConnectionRetryResult } from "./model-connection-retry-source";
import {
  Label,
  upgradeModel,
  default as upgradeModelProcess,
} from "./upgrade-model";

describe("upgradeModel", () => {
  let controllerConnection: ManagedConnection;
  let modelConnection: ManagedConnection;

  let upgradeModelMock: MockInstance;
  let modelStatusSourceDoneMock: Mock;
  let modelStatusSource: MockInstance;
  let modelStatusSourceImplementation: Source<ConnectionRetryResult>;

  beforeEach(() => {
    vi.useFakeTimers();

    upgradeModelMock = vi.fn().mockResolvedValue({ "chosen-version": "1.2.3" });
    controllerConnection = {
      facades: {
        modelUpgrader: {
          upgradeModel: upgradeModelMock,
        },
      },
    } as unknown as ManagedConnection;
    modelConnection = {} as ManagedConnection;
    modelStatusSourceDoneMock = vi.fn();
    modelStatusSourceImplementation = {
      done: modelStatusSourceDoneMock,
      [Symbol.asyncIterator]: async function* () {
        yield { version: "1.2.3" };
      },
    } as unknown as Source<ConnectionRetryResult>;
    modelStatusSource = vi
      .spyOn(modelConnectionRetrySourceModule, "default")
      .mockReturnValue(modelStatusSourceImplementation);
  });

  describe("controller `upgradeModel` request", () => {
    it("calls on controller connection with correct model tag", async ({
      expect,
    }) => {
      expect.assertions(2);
      const progress = upgradeModel(
        "abc123",
        "1.2.3",
        controllerConnection,
        modelConnection,
      );

      await expect(progress.next()).resolves.toEqual({
        done: false,
        value: { status: "pending" },
      });
      expect(upgradeModelMock).toHaveBeenCalledExactlyOnceWith({
        "model-tag": "model-abc123",
        "target-version": "1.2.3",
      });
    });

    it("throws an error if request isn't successful", async ({ expect }) => {
      expect.assertions(3);
      upgradeModelMock.mockResolvedValue({ error: "Uh oh!" });
      const progress = upgradeModel(
        "abc123",
        "1.2.3",
        controllerConnection,
        modelConnection,
      );

      await expect(progress.next()).resolves.toEqual({
        done: false,
        value: { status: "pending" },
      });
      expect(upgradeModelMock).toHaveBeenCalledExactlyOnceWith({
        "model-tag": "model-abc123",
        "target-version": "1.2.3",
      });

      await expect(progress.next()).rejects.toThrowError(
        Label.ERROR_INIT_FAILED,
      );
    });
  });

  describe("model `fullStatus` polling", () => {
    it("begins polling model after success", async ({ expect }) => {
      expect.assertions(1);
      const progress = upgradeModel(
        "abc123",
        "1.2.3",
        controllerConnection,
        modelConnection,
      );

      await progress.next(); // Pending
      await progress.next(); // Initiating

      void progress.next();
      expect(modelStatusSource).toHaveBeenCalledExactlyOnceWith(
        modelConnection,
      );
    });

    describe("while polling", () => {
      let modelStatusPromises: PromiseWithResolvers<ConnectionRetryResult>[];

      beforeEach(() => {
        modelStatusPromises = new Array(10)
          .fill(null)
          .map(() => Promise.withResolvers());
        modelStatusSourceImplementation[Symbol.asyncIterator] =
          async function* (): AsyncGenerator<
            ConnectionRetryResult,
            void,
            void
          > {
            for (const { promise } of modelStatusPromises) {
              yield await promise;
            }
          };
      });

      it("doesn't advance until version matches", async ({ expect }) => {
        expect.assertions(4);
        const progress = upgradeModel(
          "abc123",
          "1.2.3",
          controllerConnection,
          modelConnection,
        );

        await progress.next(); // Pending
        await progress.next(); // Initiating

        const statusResolvedMock = vi.fn();
        const nextStatus = progress
          .next()
          .then(statusResolvedMock.mockImplementation((value) => value));

        modelStatusPromises[0].resolve({ version: "0.0.0" });
        await vi.runOnlyPendingTimersAsync();
        expect(statusResolvedMock).not.toHaveBeenCalled();

        modelStatusPromises[1].resolve({ version: "0.0.0" });
        await vi.runOnlyPendingTimersAsync();
        expect(statusResolvedMock).not.toHaveBeenCalled();

        modelStatusPromises[2].resolve({ version: "1.2.3" });
        await vi.runOnlyPendingTimersAsync();
        expect(statusResolvedMock).toHaveBeenCalledOnce();

        await expect(nextStatus).resolves.toEqual({ done: true });
      });

      it("calls `done` on source after completion", async ({ expect }) => {
        expect.assertions(1);
        const progress = upgradeModel(
          "abc123",
          "1.2.3",
          controllerConnection,
          modelConnection,
        );

        modelStatusPromises[0].resolve({ version: "1.2.3" });

        await progress.next(); // Pending
        await progress.next(); // Initiating
        await progress.next(); // Done

        expect(modelStatusSourceDoneMock).toHaveBeenCalledOnce();
      });

      it("emits status when reconnecting", async ({ expect }) => {
        expect.assertions(3);
        const progress = upgradeModel(
          "abc123",
          "1.2.3",
          controllerConnection,
          modelConnection,
        );

        await progress.next(); // Pending
        await progress.next(); // Initiating

        const statusResolvedMock = vi.fn();
        const nextStatus = progress
          .next()
          .then(statusResolvedMock.mockImplementation((value) => value));

        modelStatusPromises[0].resolve({ version: "0.0.0" });
        await vi.runOnlyPendingTimersAsync();
        expect(statusResolvedMock).not.toHaveBeenCalled();

        modelStatusPromises[1].resolve({ reconnecting: true });
        await vi.runOnlyPendingTimersAsync();
        expect(statusResolvedMock).toHaveBeenCalled();

        await expect(nextStatus).resolves.toEqual({
          value: { status: "reconnecting" },
          done: false,
        });
      });

      it("emits loading status at an interval", async ({ expect }) => {
        expect.assertions(2);
        const progress = upgradeModel(
          "abc123",
          "1.2.3",
          controllerConnection,
          modelConnection,
        );

        await progress.next(); // Pending
        await progress.next(); // Initiating

        modelStatusPromises
          .slice(0, modelStatusPromises.length - 1)
          .map(({ resolve }) => {
            resolve({ version: "0.0.0" });
          });
        modelStatusPromises[modelStatusPromises.length - 1].resolve({
          version: "1.2.3",
        });

        await expect(progress.next()).resolves.toEqual({
          value: { status: "loading" },
          done: false,
        });

        await expect(progress.next()).resolves.toEqual({
          done: true,
        });
      });
    });
  });
});

describe("action", () => {
  it("contains meta properties", ({ expect }) => {
    const action = upgradeModelProcess.actions.run({
      wsControllerURL: "wss://example.com/api",
      modelName: "some-model",
      modelUUID: "abc123",
      modelURL: "wss://example.com/model/abc123/api",
      currentVersion: "0.0.0",
      targetVersion: "1.2.3",
    });

    expect(action).toEqual(
      expect.objectContaining({
        meta: {
          withConnection: true,
          connectionList: ["wsControllerURL", "modelURL"],
        },
      }),
    );
  });
});
