import type { Mock } from "vitest";

import { Label } from "juju/jimm/api";
import type { ManagedConnection } from "store/middleware/connection/connection-manager";
import { jobInfoFactory } from "testing/factories/juju/jimm";

import { getJobInfo } from "./job-info-source";

describe("createJobInfoSource", () => {
  let connection: ManagedConnection;
  let jobInfoMock: Mock;

  beforeEach(() => {
    jobInfoMock = vi.fn().mockResolvedValue(jobInfoFactory.build());
    connection = {
      facades: {
        jimM: {
          jobInfo: jobInfoMock,
        },
      },
    } as unknown as ManagedConnection;
  });

  it("calls `jobInfo` method on provided connection", async ({ expect }) => {
    const tryConnection = getJobInfo(connection, "1");
    expect(jobInfoMock).not.toHaveBeenCalled();

    await expect(tryConnection()).resolves.toEqual(jobInfoFactory.build());
    expect(jobInfoMock).toHaveBeenCalledTimes(1);

    await expect(tryConnection()).resolves.toEqual(jobInfoFactory.build());
    expect(jobInfoMock).toHaveBeenCalledTimes(2);

    await expect(tryConnection()).resolves.toEqual(jobInfoFactory.build());
    expect(jobInfoMock).toHaveBeenCalledTimes(3);
  });

  it("throws error if `jimM` facade isn't present", async ({ expect }) => {
    delete connection.facades.jimM;

    const tryConnection = getJobInfo(connection, "1");
    await expect(tryConnection()).rejects.toThrowError(Label.NO_JIMM);
  });
});
