import type { ApplicationStatus } from "@canonical/jujulib/dist/api/facades/client/ClientV6";
import type { FC } from "react";

import CharmIcon from "components/CharmIcon/CharmIcon";
import type { WatcherModelData } from "juju/types";

type Props = {
  applicationName: string;
  applications:
    | Record<string, ApplicationStatus>
    | WatcherModelData["applications"];
};

const RelationIcon: FC<Props> = ({ applicationName, applications }: Props) => {
  if (!(applicationName in applications)) {
    return null;
  }
  const application = applications[applicationName];
  const charmId =
    "charm-url" in application
      ? application["charm-url"]
      : "charm" in application
        ? application["charm"]
        : null;
  if (charmId === null || !charmId) {
    return null;
  }
  return <CharmIcon name={applicationName} charmId={charmId} />;
};

export default RelationIcon;
