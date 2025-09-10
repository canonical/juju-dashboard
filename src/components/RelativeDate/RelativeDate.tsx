import { Tooltip } from "@canonical/react-components";
import type { FC } from "react";

import { formatFriendlyDateToNow } from "components/utils";

type Props = {
  datetime: string;
};

const RelativeDate: FC<Props> = ({ datetime }: Props) => {
  return (
    <Tooltip
      message={new Date(datetime).toLocaleString()}
      position="top-center"
    >
      {formatFriendlyDateToNow(datetime)}
    </Tooltip>
  );
};

export default RelativeDate;
