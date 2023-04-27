import CharmIcon from "components/CharmIcon/CharmIcon";
import type { ModelData } from "juju/types";

type Props = {
  applicationName: string;
  applications: ModelData["applications"];
};

const RelationIcon = ({ applicationName, applications }: Props) => {
  if (!(applicationName in applications)) {
    return null;
  }
  const application = applications[applicationName];
  return (
    <CharmIcon name={applicationName} charmId={application["charm-url"]} />
  );
};

export default RelationIcon;
