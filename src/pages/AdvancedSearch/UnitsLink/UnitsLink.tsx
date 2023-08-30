import { type PropsWithChildren } from "react";
import { Link } from "react-router-dom";

import { useModelByUUIDDetails } from "components/hooks";
import urls from "urls";

type Props = {
  uuid: string;
  appName: string | null;
  unitId: string | null;
} & PropsWithChildren;

const UnitsLink = ({ uuid, appName, unitId, children }: Props): JSX.Element => {
  const { userName, modelName } = useModelByUUIDDetails({ uuid });

  // If at least one of the bellow values is falsy, we can't form a valid Link.
  if (!userName || !modelName || !appName || !unitId) {
    return <>{children}:</>;
  }

  return (
    <Link to={urls.model.unit({ userName, modelName, appName, unitId })}>
      {children}:
    </Link>
  );
};

export default UnitsLink;
