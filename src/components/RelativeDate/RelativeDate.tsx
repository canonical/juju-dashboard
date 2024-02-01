import { Tooltip } from "@canonical/react-components";

import { formatFriendlyDateToNow } from "components/utils";

type Props = {
  datetime: string;
};

const RelativeDate = ({ datetime }: Props) => {
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
