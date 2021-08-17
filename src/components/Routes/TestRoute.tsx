import { Route } from "react-router-dom";

type Props = {
  path: string;
  children: JSX.Element;
};

export default function TestRoute({ path, children }: Props) {
  return <Route path={path}>{children}</Route>;
}
