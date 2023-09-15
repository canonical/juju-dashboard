import type { PropsWithSpread } from "@canonical/react-components";
import * as React from "react";
import { Link } from "react-router-dom";
import type { LinkProps } from "react-router-dom";

import type { ModelTab } from "urls";
import urls from "urls";
import { getUserName } from "utils";

type Props = PropsWithSpread<
  {
    modelName: string;
    ownerTag?: string | null;
    view?: ModelTab;
    className?: string;
  } & React.PropsWithChildren,
  Partial<LinkProps & React.RefAttributes<HTMLAnchorElement>>
>;

const ModelDetailsLink = ({
  modelName,
  ownerTag,
  children,
  view,
  ...props
}: Props) => {
  // Because we get some data at different times based on the multiple API calls
  // we need to check for their existence and supply reasonable fallbacks if it
  // isn't available. Once we have a single API call for all the data this check
  // can be removed.
  if (!ownerTag) {
    // We will just return an unclickable name until we get an owner tag as
    // without it we can't create a reliable link.
    return <>{children}</>;
  }
  // If the owner isn't the logged in user then we need to use the
  // fully qualified path name.
  const userName = getUserName(ownerTag);
  return (
    <Link
      to={
        view
          ? urls.model.tab({ userName, modelName, tab: view })
          : urls.model.index({ userName, modelName })
      }
      {...props}
    >
      {children}
    </Link>
  );
};

export default ModelDetailsLink;
