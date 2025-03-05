import type { JSX } from "react";

import BaseLayout from "layout/BaseLayout";
import PageNotFound from "pages/PageNotFound";

import type { Props } from "./types";

const CheckPermissions = ({
  allowed,
  children,
  loading,
  ...props
}: Props): JSX.Element => {
  if (loading) {
    return <BaseLayout {...props} loading />;
  }
  return allowed ? <>{children}</> : <PageNotFound {...props} />;
};

export default CheckPermissions;
