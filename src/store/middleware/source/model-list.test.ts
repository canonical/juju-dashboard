import type { MockInstance } from "vitest";

import type { ConnectionWithFacades, UserModelList } from "juju/types";

import { ModelsError } from "../types";

import middleware, {
  getModelList,
  NOT_AUTHENTICATED_ERROR,
} from "./model-list";

describe("getModelList", () => {
  let connection: ConnectionWithFacades;
  let listModels: MockInstance;

  beforeEach(() => {
    listModels = vi.fn();
    connection = {
      info: {
        user: { identity: "user-eggman@external" },
      },
      facades: {
        modelManager: {
          listModels,
        },
      },
    } as unknown as ConnectionWithFacades;
    vi.useFakeTimers();
  });

  it("produces models from `listModels` call", async ({ expect }) => {
    const models = [
      { model: { name: "model-1" } },
      { model: { name: "model-2" } },
      { model: { name: "model-3" } },
    ] as unknown as UserModelList;
    listModels.mockResolvedValue({
      "user-models": models,
    });
    const result = await getModelList(connection);
    expect(listModels).toHaveBeenCalledExactlyOnceWith({
      tag: "user-eggman@external",
    });
    expect(result).toStrictEqual({ "user-models": models });
  });

  it("produces empty list if listModels returns nothing", async ({
    expect,
  }) => {
    listModels.mockResolvedValue(undefined);
    const result = await getModelList(connection);
    expect(listModels).toHaveBeenCalledExactlyOnceWith({
      tag: "user-eggman@external",
    });
    expect(result).toStrictEqual({ "user-models": [] });
  });

  it("throws error if no identity on connection", async ({ expect }) => {
    delete connection.info.user;
    const result = getModelList(connection);
    await expect(result).rejects.toThrow(NOT_AUTHENTICATED_ERROR);
  });

  it("throws error if listModels fails", async ({ expect }) => {
    listModels.mockRejectedValue(new Error("something"));
    const result = getModelList(connection);
    await expect(result).rejects.toThrow(ModelsError.LIST_OR_UPDATE_MODELS);
  });
});

describe("actions", () => {
  it("start action includes `withConnection`", ({ expect }) => {
    const action = middleware.actions.start({
      wsControllerURL: "wss://example.com",
    });
    expect(action).toEqual(
      expect.objectContaining({
        meta: { withConnection: true },
      }),
    );
  });
});
