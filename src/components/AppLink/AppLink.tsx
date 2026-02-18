import type { JSX } from "react";
import type { PropsWithChildren } from "react";
import { Link } from "react-router";

import { useModelByUUIDDetails } from "components/hooks";
import urls, { type AppTab } from "urls";

type Props = {
  uuid: string;
  appName: string;
  view?: AppTab;
} & PropsWithChildren;

const AppLink = ({ uuid, appName, view, children }: Props): JSX.Element => {
  const { qualifier, modelName } = useModelByUUIDDetails({ uuid });

  // If at least one of the below values is falsy, we can't form a valid Link.
  if (!qualifier || !modelName || !appName) {
    return <>{children}</>;
  }

  return (
    <Link
      // Prevent toggling the object when the link is clicked.
      onClick={(event) => {
        event.stopPropagation();
      }}
      to={
        view
          ? urls.model.app.tab({ qualifier, modelName, appName, tab: view })
          : urls.model.app.index({ qualifier, modelName, appName })
      }
    >
      {children}
    </Link>
  );
};

export default AppLink;
