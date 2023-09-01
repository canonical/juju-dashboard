import { type PropsWithChildren } from "react";
import { Link } from "react-router-dom";

import { useModelByUUIDDetails } from "components/hooks";
import urls from "urls";

type Props = {
  uuid: string;
  machineId: string | null;
} & PropsWithChildren;

const MachineLink = ({ uuid, machineId, children }: Props): JSX.Element => {
  const { userName, modelName } = useModelByUUIDDetails({ uuid });

  // If at least one of the bellow values is falsy, we can't form a valid Link.
  if (!userName || !modelName || !machineId || typeof uuid !== "string") {
    return <>{children}</>;
  }

  return (
    <Link
      // Prevent toggling the object when the link is clicked.
      onClick={(event) => event.stopPropagation()}
      to={urls.model.machine({ userName, modelName, machineId })}
    >
      {children}
    </Link>
  );
};

export default MachineLink;
