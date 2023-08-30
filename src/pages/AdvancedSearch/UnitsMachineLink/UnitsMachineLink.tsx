import { type PropsWithChildren } from "react";
import { Link } from "react-router-dom";

import { useModelByUUIDDetails } from "components/hooks";
import urls from "urls";

type Props = {
  uuid: string;
  machineId: string | null;
} & PropsWithChildren;

const UnitsMachineLink = ({
  uuid,
  machineId,
  children,
}: Props): JSX.Element => {
  const { userName, modelName } = useModelByUUIDDetails({ uuid });

  // If at least one of the bellow values is falsy, we can't form a valid Link.
  if (!userName || !modelName || !machineId || typeof uuid !== "string") {
    return <>{children}</>;
  }

  return (
    <Link to={urls.model.machine({ userName, modelName, machineId })}>
      {children}
    </Link>
  );
};

export default UnitsMachineLink;
