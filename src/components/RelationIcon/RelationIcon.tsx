import type { ApplicationStatus } from "@canonical/jujulib/dist/api/facades/client/ClientV6";

import CharmIcon from "components/CharmIcon/CharmIcon";
import type { ModelData } from "juju/types";

type Props = {
  applicationName: string;
  applications: ModelData["applications"] | Record<string, ApplicationStatus>;
};

const RelationIcon = ({ applicationName, applications }: Props) => {
  if (!(applicationName in applications)) {
    return null;
  }
  const application = applications[applicationName];
  const charmId =
    "charm-url" in application
      ? application["charm-url"]
      : application["charm"];
  return <CharmIcon name={applicationName} charmId={charmId} />;
};

export default RelationIcon;
