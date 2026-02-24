import type { ApplicationStatus } from "@canonical/jujulib/dist/api/facades/client/ClientV8";
import type { FC } from "react";

import CharmIcon from "components/CharmIcon/CharmIcon";

type Props = {
  applicationName: string;
  applications: Record<string, ApplicationStatus>;
};

const RelationIcon: FC<Props> = ({ applicationName, applications }: Props) => {
  if (!(applicationName in applications)) {
    return null;
  }
  const application = applications[applicationName];
  return <CharmIcon name={applicationName} charmId={application.charm} />;
};

export default RelationIcon;
