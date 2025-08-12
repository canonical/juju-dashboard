import type { ConnectionWithFacades } from "juju/types";

import type { FindAuditEventsRequest } from "./JIMMV3";
import type { RelationshipTuple } from "./JIMMV4";

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
export async function findAuditEvents(
  conn: ConnectionWithFacades,
  params?: FindAuditEventsRequest,
) {
  if (!conn.facades.jimM) {
    throw new Error(Label.NO_JIMM);
  }
  return await conn.facades.jimM.findAuditEvents(params);
}

/**
  Query all the available models and each entity within the model.
 */
export async function crossModelQuery(
  conn: ConnectionWithFacades,
  query: string,
) {
  if (!conn.facades.jimM) {
    throw new Error(Label.NO_JIMM);
  }
  return await conn.facades.jimM.crossModelQuery(query);
}

/**
 Check if a user has the specified relation to a resource. 
 */
export async function checkRelation(
  conn: ConnectionWithFacades,
  tuple: RelationshipTuple,
) {
  if (!conn.facades.jimM) {
    throw new Error(Label.NO_JIMM);
  }
  return await conn.facades.jimM.checkRelation(tuple);
}

/**
 Perform an authorisation check for a list of tuples.
 */
export async function checkRelations(
  conn: ConnectionWithFacades,
  tuples: RelationshipTuple[],
) {
  if (!conn.facades.jimM) {
    throw new Error(Label.NO_JIMM);
  }
  return await conn.facades.jimM.checkRelations(tuples);
}

/**
 Initiate an internal model migration via the JIMM facade.
 */
export async function migrateModel(
  conn: ConnectionWithFacades,
  modelName: string,
  targetController: string,
) {
  if (!conn.facades.jimM) {
    throw new Error(Label.NO_JIMM);
  }
  return await conn.facades.jimM.migrateModel(modelName, targetController);
}

/**
 Fetch the list of valid target controllers for an internal model migration.
 */
export async function listMigrationTargets(
  conn: ConnectionWithFacades,
  modelTag: string,
) {
  if (!conn.facades.jimM) {
    throw new Error(Label.NO_JIMM);
  }
  return await conn.facades.jimM.listMigrationTargets(modelTag);
}
