import type { HistoryItem } from "store/juju/types";

import type { ProcessOutput, TableLinks } from "../../Output/types";

export type Props = {
  processOutput?: null | ProcessOutput;
  tableLinks?: null | TableLinks;
} & HistoryItem;
