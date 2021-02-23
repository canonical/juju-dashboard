import { Route } from "react-router-dom";

import { paths } from "./Routes";

type Props = {
  path: string;
  children: JSX.Element;
};

export default function TestRoute({ path, children }: Props) {
  // Validate paths
  if (Object.keys(paths).indexOf(path) < 0) {
    throw new Error("Path not found in application routes");
  }
  return <Route path={path}>{children}</Route>;
}
