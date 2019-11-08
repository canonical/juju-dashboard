import React from "react";
import { Route } from "react-router-dom";

import { paths } from "./Routes";

export default function TestRoute({ path, children } = {}) {
  // Validate paths
  if (Object.keys(paths).indexOf(path) < 0) {
    throw new Error("Path not found in application routes");
  }
  return <Route path={path}>{children}</Route>;
}
