import type { HistoryItem } from "store/juju/types";

import type { ProcessOutput, TableLinks } from "../../Output/types";

export type Props = {
  processOutput?: ProcessOutput | null;
  tableLinks?: TableLinks | null;
} & HistoryItem;
