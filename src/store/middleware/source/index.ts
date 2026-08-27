import type { Middleware } from "redux";

import type { RootState, Store } from "store/store";

import type { SourceInstance } from "../source-middleware";
import createMiddleware from "../source-middleware";

import cloudInfo from "./cloud-info";
import jimmSupportedVersions from "./jimm-supported-versions";
import migrationTargets from "./migration-targets";
import modelConfigDefaults from "./model-config-defaults";
import modelList from "./model-list";
import userCredentials from "./user-credentials";

export default function createSourceMiddleware(): Middleware<
  void,
  RootState,
  Store["dispatch"]
> {
  return createMiddleware([
    modelList as SourceInstance<unknown, unknown>,
    jimmSupportedVersions as SourceInstance<unknown, unknown>,
    migrationTargets as SourceInstance<unknown, unknown>,
    userCredentials as SourceInstance<unknown, unknown>,
    cloudInfo as SourceInstance<unknown, unknown>,
    modelConfigDefaults as SourceInstance<unknown, unknown>,
  ]);
}
