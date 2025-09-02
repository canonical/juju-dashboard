import type { ConnectionWithFacades, Facades } from "juju/types";

import type { FindAuditEventsRequest } from "./JIMMV3";
import type { MigrateModelInfo, RelationshipTuple } from "./JIMMV4";

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
 * A wrapper function that performs the JIMM facade check before executing
 * the provided async function.
 */
const withJimmCheck = <T>(
  conn: ConnectionWithFacades,
  facadeMethod: (jimm: NonNullable<Facades["jimM"]>) => Promise<T>,
): Promise<T> => {
  if (!conn.facades.jimM) {
    throw new Error(Label.NO_JIMM);
  }
  return facadeMethod(conn.facades.jimM);
};

/**
  Fetch audit events via the JIMM facade on the given controller connection.
 */
export const findAuditEvents = async (
  conn: ConnectionWithFacades,
  params?: FindAuditEventsRequest,
) => {
  return withJimmCheck(conn, (jimm) => jimm.findAuditEvents(params));
};

/**
  Query all the available models and each entity within the model.
 */
export const crossModelQuery = async (
  conn: ConnectionWithFacades,
  query: string,
) => {
  return withJimmCheck(conn, (jimm) => jimm.crossModelQuery(query));
};

/**
 Check if a user has the specified relation to a resource. 
 */
export const checkRelation = async (
  conn: ConnectionWithFacades,
  tuple: RelationshipTuple,
) => {
  return withJimmCheck(conn, (jimm) => jimm.checkRelation(tuple));
};

/**
 Perform an authorisation check for a list of tuples.
 */
export const checkRelations = async (
  conn: ConnectionWithFacades,
  tuples: RelationshipTuple[],
) => {
  return withJimmCheck(conn, (jimm) => jimm.checkRelations(tuples));
};

/**
 Initiate an internal model migration via the JIMM facade.
 */
export const migrateModel = async (
  conn: ConnectionWithFacades,
  migrationSpecs: MigrateModelInfo[],
) => {
  return withJimmCheck(conn, (jimm) => jimm.migrateModel(migrationSpecs));
};

/**
 Fetch the list of valid target controllers for an internal model migration.
 */
export const listMigrationTargets = async (
  conn: ConnectionWithFacades,
  modelTag: string,
) => {
  return withJimmCheck(conn, (jimm) => jimm.listMigrationTargets(modelTag));
};
