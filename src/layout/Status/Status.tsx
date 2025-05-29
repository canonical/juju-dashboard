import JujuCLI from "components/JujuCLI";

import type { Props } from "./types";
import { StatusView } from "./types";

const Status = ({ status }: Props) => {
  switch (status) {
    case StatusView.CLI:
      return <JujuCLI />;
    default:
      return null;
  }
};

export default Status;
