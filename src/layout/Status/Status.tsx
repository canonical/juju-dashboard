import type { FC } from "react";

import JujuCLI from "components/JujuCLI";

import type { Props } from "./types";
import { StatusView } from "./types";

const Status: FC<Props> = ({ status = null }: Props) => {
  switch (status) {
    case StatusView.CLI:
      return <JujuCLI />;
    default:
      if (status != null && status) {
        throw new Error(`Unhandled status view state: ${status}`);
      }
      return null;
  }
};

export default Status;
