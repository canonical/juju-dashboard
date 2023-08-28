import type { PropsWithSpread } from "@canonical/react-components";
import * as React from "react";
import { Link } from "react-router-dom";
import type { LinkProps } from "react-router-dom";

import { getModelByUUID } from "store/juju/selectors";
import { useAppSelector } from "store/store";
import type { ModelTab } from "urls";
import urls from "urls";

type BaseProps = {
  view?: ModelTab;
} & React.PropsWithChildren;

type NameProps = BaseProps & {
  modelName: string;
  ownerTag?: string | null;
  replaceLabel?: never;
  uuid?: never;
};

export type UUIDProps = BaseProps & {
  modelName?: never;
  ownerTag?: never;
  replaceLabel?: boolean;
  uuid: string;
};

export type Props = PropsWithSpread<
  NameProps | UUIDProps,
  Partial<LinkProps & React.RefAttributes<HTMLAnchorElement>>
>;

const ModelDetailsLink = ({
  modelName,
  ownerTag,
  children,
  replaceLabel,
  uuid,
  view,
  ...props
}: Props) => {
  const modelDetails = useAppSelector((state) => getModelByUUID(state, uuid));
  const owner = uuid ? modelDetails?.ownerTag : ownerTag;
  const model = uuid ? modelDetails?.name : modelName;
  // Because we get some data at different times based on the multiple API calls
  // we need to check for their existence and supply reasonable fallbacks if it
  // isn't available. Once we have a single API call for all the data this check
  // can be removed.
  if (!owner || !model) {
    // We will just return an unclickable name until we get an owner tag as
    // without it we can't create a reliable link.
    return <>{children}</>;
  }
  // If the owner isn't the logged in user then we need to use the
  // fully qualified path name.
  const userName = owner.replace("user-", "");
  const label =
    replaceLabel && userName && model ? `${userName}/${model}` : children;
  return (
    <Link
      to={
        view
          ? urls.model.tab({ userName, modelName: model, tab: view })
          : urls.model.index({ userName, modelName: model })
      }
      {...props}
    >
      {label}
    </Link>
  );
};

export default ModelDetailsLink;
