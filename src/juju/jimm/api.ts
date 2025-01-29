import type { ConnectionWithFacades } from "juju/types";

import type { FindAuditEventsRequest, AuditEvents } from "./JIMMV3";
import type { CrossModelQueryResponse, RelationshipTuple } from "./JIMMV4";

export enum Label {
  NO_JIMM = "Not connected to JIMM.",
}

export const endpoints = () => {
  const jimmEndpoint =
    window.jujuDashboardConfig?.controllerAPIEndpoint
      .replace("wss://", "https://")
      .replace("ws://", "http://")
      .replace(/\/api$/, "") ?? "";
  return {
    login: `${jimmEndpoint}/auth/login`,
    logout: `${jimmEndpoint}/auth/logout`,
    rebac: `${jimmEndpoint}/rebac/v1`,
    whoami: `${jimmEndpoint}/auth/whoami`,
  };
};

/**
  Fetch audit events via the JIMM facade on the given controller connection.
 */
export function findAuditEvents(
  conn: ConnectionWithFacades,
  params?: FindAuditEventsRequest,
) {
  return new Promise<AuditEvents>((resolve, reject) => {
    if (conn?.facades?.jimM) {
      conn.facades.jimM
        .findAuditEvents(params)
        .then((events) => resolve(events))
        .catch((error) => reject(error));
    } else {
      reject(new Error(Label.NO_JIMM));
    }
  });
}

export function crossModelQuery(conn: ConnectionWithFacades, query: string) {
  return new Promise<CrossModelQueryResponse>((resolve, reject) => {
    if (conn?.facades?.jimM) {
      conn.facades.jimM
        .crossModelQuery(query)
        .then((crossModelQueryResponse) => resolve(crossModelQueryResponse))
        .catch((error) => reject(error));
    } else {
      reject(new Error(Label.NO_JIMM));
    }
  });
}

export const checkRelation = async (
  conn: ConnectionWithFacades,
  tuple: RelationshipTuple,
) => {
  if (!conn.facades.jimM) {
    throw new Error(Label.NO_JIMM);
  }
  return await conn.facades.jimM.checkRelation(tuple);
};
