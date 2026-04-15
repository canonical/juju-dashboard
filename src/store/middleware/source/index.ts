import type { Middleware } from "@reduxjs/toolkit";

import type { RootState, Store } from "store/store";

import cloudInfo from "./cloud-info";
import jimmSupportedVersions from "./jimm-supported-versions";
import migrationTargets from "./migration-targets";
import modelList from "./model-list";
import userCredentials from "./user-credentials";

export default [
  modelList.middleware,
  jimmSupportedVersions.middleware,
  migrationTargets.middleware,
  userCredentials.middleware,
  cloudInfo.middleware,
] satisfies Middleware<void, RootState, Store["dispatch"]>[];
