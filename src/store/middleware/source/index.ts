import type { Middleware } from "@reduxjs/toolkit";

import type { RootState, Store } from "store/store";

import jimmSupportedVersions from "./jimm-supported-versions";
import migrationTargets from "./migration-targets";
import modelList from "./model-list";

export default [
  modelList.middleware,
  jimmSupportedVersions.middleware,
  migrationTargets.middleware,
] satisfies Middleware<void, RootState, Store["dispatch"]>[];
