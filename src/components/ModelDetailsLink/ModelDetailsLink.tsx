import type { PropsWithSpread } from "@canonical/react-components";
import type * as React from "react";
import { Link } from "react-router";
import type { LinkProps } from "react-router";

import { useModelByUUIDDetails } from "components/hooks";
import type { ModelTab } from "urls";
import urls from "urls";
import { getUserName } from "utils";

type BaseProps = {
  view?: ModelTab;
} & React.PropsWithChildren;

type NameProps = {
  modelName: string;
  qualifier?: null | string;
  replaceLabel?: never;
  uuid?: never;
} & BaseProps;

export type UUIDProps = {
  modelName?: never;
  qualifier?: never;
  replaceLabel?: boolean;
  uuid: string;
} & BaseProps;

export type Props = PropsWithSpread<
  NameProps | UUIDProps,
  Partial<LinkProps & React.RefAttributes<HTMLAnchorElement>>
>;

const ModelDetailsLink: React.FC<Props> = ({
  modelName,
  qualifier,
  children,
  replaceLabel,
  uuid,
  view,
  ...props
}: Props) => {
  // This component's props require either uuid or modelName to exist,
  // but this characteristic gets lost when the props are destructured.
  const { modelName: model, qualifier: owner } = useModelByUUIDDetails(
    uuid
      ? ({ uuid } as UUIDProps)
      : ({
          qualifier,
          modelName,
        } as NameProps),
  );
  // Because we get some data at different times based on the multiple API calls
  // we need to check for their existence and supply reasonable fallbacks if it
  // isn't available. Once we have a single API call for all the data this check
  // can be removed.
  if (!owner || !model) {
    // We will just return an un-clickable name until we get an owner tag as
    // without it we can't create a reliable link.
    return <>{children}</>;
  }
  // If the owner isn't the logged in user then we need to use the
  // fully qualified path name.
  const modelOwner = getUserName(owner);
  const label =
    replaceLabel && modelOwner && model ? `${modelOwner}/${model}` : children;
  return (
    <Link
      to={
        view
          ? urls.model.tab({
              qualifier: modelOwner,
              modelName: model,
              tab: view,
            })
          : urls.model.index({ qualifier: modelOwner, modelName: model })
      }
      {...props}
    >
      {label}
    </Link>
  );
};

export default ModelDetailsLink;
