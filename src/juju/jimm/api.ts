import type { InitiateMigrationResults } from "@canonical/jujulib/dist/api/facades/controller/ControllerV12";

import type { ConnectionWithFacades, Facades } from "juju/types";

import type { AuditEvents, FindAuditEventsRequest } from "./JIMMV3";
import type {
  CheckRelationResponse,
  CheckRelationsResponse,
  CrossModelQueryResponse,
  ListControllersResponse,
  MigrateModelInfo,
  RelationshipTuple,
} from "./JIMMV4";

export enum Label {
  NO_JIMM = "Not connected to JIMM.",
}

type Endpoints = {
  login: string;
  logout: string;
  rebac: string;
  whoami: string;
};

export const endpoints = (): Endpoints => {
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
const withJimmCheck = async <T>(
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
): Promise<AuditEvents> => {
  return withJimmCheck(conn, async (jimm) => jimm.findAuditEvents(params));
};

/**
  Query all the available models and each entity within the model.
 */
export const crossModelQuery = async (
  conn: ConnectionWithFacades,
  query: string,
): Promise<CrossModelQueryResponse> => {
  return withJimmCheck(conn, async (jimm) => jimm.crossModelQuery(query));
};

/**
 Check if a user has the specified relation to a resource. 
 */
export const checkRelation = async (
  conn: ConnectionWithFacades,
  tuple: RelationshipTuple,
): Promise<CheckRelationResponse> => {
  return withJimmCheck(conn, async (jimm) => jimm.checkRelation(tuple));
};

/**
 Perform an authorisation check for a list of tuples.
 */
export const checkRelations = async (
  conn: ConnectionWithFacades,
  tuples: RelationshipTuple[],
): Promise<CheckRelationsResponse> => {
  return withJimmCheck(conn, async (jimm) => jimm.checkRelations(tuples));
};

/**
 Initiate an internal model migration via the JIMM facade.
 */
export const migrateModel = async (
  conn: ConnectionWithFacades,
  migrationSpecs: MigrateModelInfo[],
): Promise<InitiateMigrationResults> => {
  return withJimmCheck(conn, async (jimm) => jimm.migrateModel(migrationSpecs));
};

/**
 Fetch the list of valid target controllers for an internal model migration.
 */
export const listMigrationTargets = async (
  conn: ConnectionWithFacades,
  modelTag: string,
): Promise<ListControllersResponse> => {
  return withJimmCheck(conn, async (jimm) =>
    jimm.listMigrationTargets(modelTag),
  );
};
