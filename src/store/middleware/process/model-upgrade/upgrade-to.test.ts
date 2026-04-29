import type { Mock, MockInstance } from "vitest";

import type { Source } from "data";
import * as jimmApi from "juju/jimm/api";
import type { ManagedConnection } from "store/middleware/connection/connection-manager";

import * as modelConnectionRetrySourceModule from "./model-connection-retry-source";
import { upgradeTo, default as upgradeToProcess } from "./upgrade-to";

describe("upgradeTo", () => {
  let controllerConnection: ManagedConnection;
  let modelConnection: ManagedConnection;

  let upgradeToMock: MockInstance;
  let modelStatusSourceDoneMock: Mock;
  let modelStatusSource: MockInstance;
  let modelStatusSourceImplementation: Source<
    { reconnecting: true } | { version: string }
  >;

  beforeEach(() => {
    vi.useFakeTimers();

    controllerConnection = {} as ManagedConnection;
    modelConnection = {} as ManagedConnection;

    upgradeToMock = vi.spyOn(jimmApi, "upgradeTo").mockResolvedValue(true);
    modelStatusSourceDoneMock = vi.fn();
    modelStatusSourceImplementation = {
      done: modelStatusSourceDoneMock,
      [Symbol.asyncIterator]: async function* () {
        yield { version: "1.2.3" };
      },
    } as unknown as Source<{ reconnecting: true } | { version: string }>;
    modelStatusSource = vi
      .spyOn(modelConnectionRetrySourceModule, "default")
      .mockReturnValue(modelStatusSourceImplementation);
  });

  describe("JIMM `upgradeTo` request", () => {
    it("calls on controller connection with correct model tag", async ({
      expect,
    }) => {
      expect.assertions(2);
      const progress = upgradeTo(
        "abc123",
        "some-controller",
        "1.2.3",
        controllerConnection,
        modelConnection,
      );

      await expect(progress.next()).resolves.toEqual({
        done: false,
        value: { status: "pending" },
      });
      expect(upgradeToMock).toHaveBeenCalledExactlyOnceWith(
        controllerConnection,
        "model-abc123",
        "some-controller",
      );
    });

    it("throws an error if request isn't successful", async ({ expect }) => {
      expect.assertions(3);
      upgradeToMock.mockResolvedValue(false);
      const progress = upgradeTo(
        "abc123",
        "some-controller",
        "1.2.3",
        controllerConnection,
        modelConnection,
      );

      await expect(progress.next()).resolves.toEqual({
        done: false,
        value: { status: "pending" },
      });
      expect(upgradeToMock).toHaveBeenCalledExactlyOnceWith(
        controllerConnection,
        "model-abc123",
        "some-controller",
      );

      await expect(progress.next()).rejects.toThrowError(
        "migration request rejected",
      );
    });
  });

  describe("model `fullStatus` polling", () => {
    it("begins polling model after success", async ({ expect }) => {
      expect.assertions(1);
      const progress = upgradeTo(
        "abc123",
        "some-controller",
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
      let promises: PromiseWithResolvers<
        { reconnecting: true } | { version: string }
      >[];

      beforeEach(() => {
        promises = new Array(10).fill(null).map(() => Promise.withResolvers());
        modelStatusSourceImplementation[Symbol.asyncIterator] =
          async function* (): AsyncGenerator<
            { reconnecting: true } | { version: string },
            void,
            void
          > {
            for (const { promise } of promises) {
              yield await promise;
            }
          };
      });

      it("doesn't advance until version matches", async ({ expect }) => {
        expect.assertions(4);
        const progress = upgradeTo(
          "abc123",
          "some-controller",
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

        promises[0].resolve({ version: "0.0.0" });
        await vi.runOnlyPendingTimersAsync();
        expect(statusResolvedMock).not.toHaveBeenCalled();

        promises[1].resolve({ version: "0.0.0" });
        await vi.runOnlyPendingTimersAsync();
        expect(statusResolvedMock).not.toHaveBeenCalled();

        promises[2].resolve({ version: "1.2.3" });
        await vi.runOnlyPendingTimersAsync();
        expect(statusResolvedMock).toHaveBeenCalledOnce();

        await expect(nextStatus).resolves.toEqual({ done: true });
      });

      it("calls `done` on source after completion", async ({ expect }) => {
        expect.assertions(1);
        const progress = upgradeTo(
          "abc123",
          "some-controller",
          "1.2.3",
          controllerConnection,
          modelConnection,
        );

        promises[0].resolve({ version: "1.2.3" });

        await progress.next(); // Pending
        await progress.next(); // Initiating
        await progress.next(); // Done

        expect(modelStatusSourceDoneMock).toHaveBeenCalledOnce();
      });

      it("emits status when reconnecting", async ({ expect }) => {
        expect.assertions(3);
        const progress = upgradeTo(
          "abc123",
          "some-controller",
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

        promises[0].resolve({ version: "0.0.0" });
        await vi.runOnlyPendingTimersAsync();
        expect(statusResolvedMock).not.toHaveBeenCalled();

        promises[1].resolve({ reconnecting: true });
        await vi.runOnlyPendingTimersAsync();
        expect(statusResolvedMock).toHaveBeenCalled();

        await expect(nextStatus).resolves.toEqual({
          value: { status: "reconnecting" },
          done: false,
        });
      });

      it("emits loading status at an interval", async ({ expect }) => {
        expect.assertions(2);
        const progress = upgradeTo(
          "abc123",
          "some-controller",
          "1.2.3",
          controllerConnection,
          modelConnection,
        );

        await progress.next(); // Pending
        await progress.next(); // Initiating

        promises.slice(0, promises.length - 1).map(({ resolve }) => {
          resolve({ version: "0.0.0" });
        });
        promises[promises.length - 1].resolve({ version: "1.2.3" });

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
    const action = upgradeToProcess.actions.run({
      wsControllerURL: "wss://example.com/api",
      modelName: "some-model",
      modelUUID: "abc123",
      modelURL: "wss://example.com/model/abc123/api",
      currentVersion: "0.0.0",
      targetVersion: "1.2.3",
      targetController: "some-controller",
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
