import type { MockInstance } from "vitest";

import * as jimmApi from "juju/jimm/api";
import type { ConnectionWithFacades } from "juju/types";

import middleware, { getMigrationTargets } from "./migration-targets";

describe("getMigrationTargets", () => {
  const connection = {} as ConnectionWithFacades;
  let listMigrationTargets: MockInstance;

  beforeEach(() => {
    listMigrationTargets = vi.spyOn(jimmApi, "listMigrationTargets");
    vi.useFakeTimers();
  });

  it("produces controller UUIDs", async ({ expect }) => {
    listMigrationTargets.mockResolvedValue({
      controllers: [
        { uuid: "controller-uuid-1" },
        { uuid: "controller-uuid-2" },
        { uuid: "controller-uuid-3" },
      ],
    });

    const result = await getMigrationTargets(connection, "abc123");
    expect(listMigrationTargets).toHaveBeenCalledExactlyOnceWith(
      connection,
      "model-abc123",
    );
    expect(result).toEqual([
      "controller-uuid-1",
      "controller-uuid-2",
      "controller-uuid-3",
    ]);
  });

  it("handles no controllers returned", async ({ expect }) => {
    listMigrationTargets.mockResolvedValue({
      controllers: [],
    });

    const result = await getMigrationTargets(connection, "abc123");
    expect(listMigrationTargets).toHaveBeenCalledExactlyOnceWith(
      connection,
      "model-abc123",
    );
    expect(result).toEqual([]);
  });
});

describe("actions", () => {
  it("start action includes `withConnection`", ({ expect }) => {
    const action = middleware.actions.start({
      wsControllerURL: "wss://example.com",
      modelUUID: "abc123",
    });
    expect(action).toEqual(
      expect.objectContaining({
        meta: { withConnection: true },
      }),
    );
  });
});
