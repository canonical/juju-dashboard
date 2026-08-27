import type { Mock, MockInstance } from "vitest";

import type { Source } from "data";
import type { ModelControllerInfo } from "juju/jimm/JIMMV4";
import { UpgradeToJobState } from "juju/jimm/JIMMV4";
import * as jimmApi from "juju/jimm/api";
import type { ManagedConnection } from "store/middleware/connection/connection-manager";
import * as modelControllerInfoSourceModule from "store/middleware/source/model-controller-info";
import {
  jobDetailFactory,
  modelControllerInfoFactory,
  upgradeToJobStatusFactory,
} from "testing/factories/juju/jimm";

import { upgradeTo, default as upgradeToProcess } from "./upgrade-to";

describe("upgradeTo", () => {
  let controllerConnection: ManagedConnection;

  let upgradeToMock: MockInstance;
  let infoSourceDoneMock: Mock;
  let infoSource: MockInstance;
  let infoSourceImplementation: Source<ModelControllerInfo>;

  beforeEach(() => {
    vi.useFakeTimers();

    controllerConnection = {} as ManagedConnection;

    upgradeToMock = vi
      .spyOn(jimmApi, "upgradeTo")
      .mockResolvedValue({ results: [{}] });
    infoSourceDoneMock = vi.fn();
    infoSourceImplementation = {
      done: infoSourceDoneMock,
      [Symbol.asyncIterator]: async function* () {
        yield modelControllerInfoFactory.build();
      },
    } as unknown as Source<ModelControllerInfo>;
    infoSource = vi
      .spyOn(modelControllerInfoSourceModule, "default")
      .mockReturnValue(infoSourceImplementation);
  });

  describe("JIMM `upgradeTo` request", () => {
    it("calls on controller connection with the model UUID", async ({
      expect,
    }) => {
      expect.assertions(2);
      const progress = upgradeTo(
        "abc123",
        "some-controller",
        controllerConnection,
      );

      await expect(progress.next()).resolves.toEqual({
        done: false,
        value: { status: "pending" },
      });
      expect(upgradeToMock).toHaveBeenCalledExactlyOnceWith(
        controllerConnection,
        ["abc123"],
        "some-controller",
      );
    });

    it("throws an error if request isn't successful", async ({ expect }) => {
      expect.assertions(3);
      upgradeToMock.mockResolvedValue({
        results: [{ error: { message: "boom", code: "bad request" } }],
      });
      const progress = upgradeTo(
        "abc123",
        "some-controller",
        controllerConnection,
      );

      await expect(progress.next()).resolves.toEqual({
        done: false,
        value: { status: "pending" },
      });
      expect(upgradeToMock).toHaveBeenCalledExactlyOnceWith(
        controllerConnection,
        ["abc123"],
        "some-controller",
      );

      await expect(progress.next()).rejects.toThrowError(
        "migration request rejected",
      );
    });
  });

  describe("model controller info polling", () => {
    it("begins polling model controller info after success", async ({
      expect,
    }) => {
      expect.assertions(1);
      const progress = upgradeTo(
        "abc123",
        "some-controller",
        controllerConnection,
      );

      await progress.next(); // Pending
      await progress.next(); // Initiating

      void progress.next();
      expect(infoSource).toHaveBeenCalledExactlyOnceWith(
        controllerConnection,
        "abc123",
      );
    });

    it("breaks and finishes when the job is completed", async ({ expect }) => {
      expect.assertions(2);
      infoSourceImplementation[Symbol.asyncIterator] =
        async function* (): AsyncGenerator<ModelControllerInfo, void, void> {
          yield modelControllerInfoFactory.build({
            "upgrade-to-job-status": upgradeToJobStatusFactory.build({
              detail: jobDetailFactory.build({
                state: UpgradeToJobState.COMPLETED,
              }),
            }),
          });
        };
      const progress = upgradeTo(
        "abc123",
        "some-controller",
        controllerConnection,
      );

      await progress.next(); // Pending
      await progress.next(); // Initiating

      await expect(progress.next()).resolves.toEqual({ done: true });
      expect(infoSourceDoneMock).toHaveBeenCalledOnce();
    });

    it.for([
      ["cancelled", UpgradeToJobState.CANCELLED],
      ["discarded", UpgradeToJobState.DISCARDED],
    ] as const)(
      "rejects when the job is %s",
      async ([_, state], { expect }) => {
        expect.assertions(1);
        infoSourceImplementation[Symbol.asyncIterator] =
          async function* (): AsyncGenerator<ModelControllerInfo, void, void> {
            yield modelControllerInfoFactory.build({
              "upgrade-to-job-status": upgradeToJobStatusFactory.build({
                detail: jobDetailFactory.build({
                  state,
                }),
              }),
            });
          };
        const progress = upgradeTo(
          "abc123",
          "some-controller",
          controllerConnection,
        );

        await progress.next(); // Pending
        await progress.next(); // Initiating

        await expect(progress.next()).rejects.toThrow(
          new Error("Upgrade failed"),
        );
      },
    );

    it("keeps polling while in-progress and emits loading at an interval", async ({
      expect,
    }) => {
      expect.assertions(2);
      // 5 in-progress polls (running / absent status) then a completed poll.
      infoSourceImplementation[Symbol.asyncIterator] =
        async function* (): AsyncGenerator<ModelControllerInfo, void, void> {
          // Absent `upgrade-to-job-status` is treated as in-progress.
          yield modelControllerInfoFactory.build();
          for (let i = 0; i < 4; i++) {
            yield modelControllerInfoFactory.build({
              "upgrade-to-job-status": upgradeToJobStatusFactory.build({
                detail: jobDetailFactory.build({
                  state: UpgradeToJobState.RUNNING,
                }),
              }),
            });
          }
          yield modelControllerInfoFactory.build({
            "upgrade-to-job-status": upgradeToJobStatusFactory.build({
              detail: jobDetailFactory.build({
                state: UpgradeToJobState.COMPLETED,
              }),
            }),
          });
        };
      const progress = upgradeTo(
        "abc123",
        "some-controller",
        controllerConnection,
      );

      await progress.next(); // Pending
      await progress.next(); // Initiating

      // The 5th in-progress poll (STATUS_TOAST_INTERVAL) emits loading.
      await expect(progress.next()).resolves.toEqual({
        value: { status: "loading" },
        done: false,
      });

      // The completed poll breaks the loop.
      await expect(progress.next()).resolves.toEqual({ done: true });
    });
  });
});

describe("action", () => {
  it("contains meta properties", ({ expect }) => {
    const action = upgradeToProcess.actions.run({
      wsControllerURL: "wss://example.com/api",
      modelName: "some-model",
      modelUUID: "abc123",
      currentVersion: "0.0.0",
      targetVersion: "1.2.3",
      targetController: "some-controller",
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
