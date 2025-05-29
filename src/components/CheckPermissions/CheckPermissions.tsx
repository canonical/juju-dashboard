import type { JSX } from "react";

import MainContent from "layout/MainContent";
import PageNotFound from "pages/PageNotFound";

import type { Props } from "./types";

const CheckPermissions = ({
  allowed,
  children,
  loading,
  ...props
}: Props): JSX.Element => {
  if (loading) {
    return <MainContent {...props} loading />;
  }
  return allowed ? <>{children}</> : <PageNotFound {...props} />;
};

export default CheckPermissions;
