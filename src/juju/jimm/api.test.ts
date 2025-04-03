import type { Connection } from "@canonical/jujulib";
import { vi } from "vitest";

import type { Config } from "store/general/types";
import { relationshipTupleFactory } from "testing/factories/juju/juju";

import {
  crossModelQuery,
  endpoints,
  findAuditEvents,
  checkRelation,
  Label,
} from "./api";

describe("JIMM API", () => {
  afterEach(() => {
    delete window.jujuDashboardConfig;
  });

  it("generates correct endpoints", () => {
    window.jujuDashboardConfig = {
      controllerAPIEndpoint: "ws://example.com/api",
    } as Config;
    const { login, logout, whoami } = endpoints();
    expect(login).toEqual("http://example.com/auth/login");
    expect(logout).toEqual("http://example.com/auth/logout");
    expect(whoami).toEqual("http://example.com/auth/whoami");
  });

  it("generates correct endpoints for secure controller API", () => {
    window.jujuDashboardConfig = {
      controllerAPIEndpoint: "wss://example.com/api",
    } as Config;
    const { login, logout, whoami } = endpoints();
    expect(login).toEqual("https://example.com/auth/login");
    expect(logout).toEqual("https://example.com/auth/logout");
    expect(whoami).toEqual("https://example.com/auth/whoami");
  });

  describe("findAuditEvents", () => {
    it("fetches audit events", async () => {
      const events = { events: [] };
      const conn = {
        facades: {
          jimM: {
            findAuditEvents: vi
              .fn()
              .mockImplementation(() => Promise.resolve(events)),
          },
        },
      } as unknown as Connection;
      const response = await findAuditEvents(conn);
      expect(conn.facades.jimM.findAuditEvents).toHaveBeenCalled();
      expect(response).toMatchObject(events);
    });

    it("fetches audit events with supplied params", async () => {
      const events = { events: [] };
      const conn = {
        facades: {
          jimM: {
            findAuditEvents: vi
              .fn()
              .mockImplementation(() => Promise.resolve(events)),
          },
        },
      } as unknown as Connection;
      const response = await findAuditEvents(conn, {
        "user-tag": "user-eggman@external",
      });
      expect(conn.facades.jimM.findAuditEvents).toHaveBeenCalledWith({
        "user-tag": "user-eggman@external",
      });
      expect(response).toMatchObject(events);
    });

    it("handles errors", async () => {
      const error = new Error("Request failed");
      const conn = {
        facades: {
          jimM: {
            findAuditEvents: vi.fn().mockImplementation(() => {
              throw error;
            }),
          },
        },
      } as unknown as Connection;
      await expect(findAuditEvents(conn)).rejects.toBe(error);
    });

    it("handles no JIMM connection", async () => {
      const conn = {
        facades: {},
      } as unknown as Connection;
      await expect(findAuditEvents(conn)).rejects.toEqual(
        new Error(Label.NO_JIMM),
      );
    });
  });

  describe("crossModelQuery", () => {
    it("fetches cross model query result with supplied params", async () => {
      const result = { results: {}, errors: {} };
      const conn = {
        facades: {
          jimM: {
            crossModelQuery: vi.fn(() => Promise.resolve(result)),
          },
        },
      } as unknown as Connection;
      const response = await crossModelQuery(conn, ".");
      expect(conn.facades.jimM.crossModelQuery).toHaveBeenCalledWith(".");
      expect(response).toMatchObject(result);
    });

    it("handles errors", async () => {
      const error = new Error("Request failed");
      const conn = {
        facades: {
          jimM: {
            crossModelQuery: vi.fn().mockImplementation(() => {
              throw error;
            }),
          },
        },
      } as unknown as Connection;
      await expect(crossModelQuery(conn, ".")).rejects.toBe(error);
    });

    it("handles no JIMM connection", async () => {
      const conn = {
        facades: {},
      } as unknown as Connection;
      await expect(crossModelQuery(conn, ".")).rejects.toMatchObject(
        new Error(Label.NO_JIMM),
      );
    });

    it("should handle exceptions", async () => {
      const conn = {
        facades: {
          jimM: {
            crossModelQuery: vi.fn(() =>
              Promise.reject(
                new Error("Error while trying to run cross model query!"),
              ),
            ),
          },
        },
      } as unknown as Connection;
      await expect(crossModelQuery(conn, ".")).rejects.toMatchObject(
        new Error("Error while trying to run cross model query!"),
      );
    });
  });

  describe("checkRelation", () => {
    it("fetches cross model query result with supplied params", async () => {
      const tuple = relationshipTupleFactory.build();
      const conn = {
        facades: {
          jimM: {
            checkRelation: vi.fn(() => Promise.resolve(true)),
          },
        },
      } as unknown as Connection;
      const response = await checkRelation(conn, tuple);
      expect(conn.facades.jimM.checkRelation).toHaveBeenCalledWith(tuple);
      expect(response).toStrictEqual(true);
    });

    it("handles errors", async () => {
      const error = new Error("Request failed");
      const conn = {
        facades: {
          jimM: {
            checkRelation: vi.fn().mockImplementation(() => {
              throw error;
            }),
          },
        },
      } as unknown as Connection;
      await expect(
        checkRelation(conn, relationshipTupleFactory.build()),
      ).rejects.toBe(error);
    });

    it("handles no JIMM connection", async () => {
      const conn = {
        facades: {},
      } as unknown as Connection;
      await expect(
        checkRelation(conn, relationshipTupleFactory.build()),
      ).rejects.toMatchObject(new Error(Label.NO_JIMM));
    });

    it("should handle exceptions", async () => {
      const conn = {
        facades: {
          jimM: {
            checkRelation: vi.fn(() =>
              Promise.reject(
                new Error("Error while trying to run cross model query!"),
              ),
            ),
          },
        },
      } as unknown as Connection;
      await expect(
        checkRelation(conn, relationshipTupleFactory.build()),
      ).rejects.toMatchObject(
        new Error("Error while trying to run cross model query!"),
      );
    });
  });
});
