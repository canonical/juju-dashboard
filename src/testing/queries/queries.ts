import { queries } from "@testing-library/react";

import * as notificationQueries from "./notifications";
import * as spinnerQueries from "./spinners";
import * as tableQueries from "./tables";

const customQueries = {
  ...notificationQueries,
  ...queries,
  ...spinnerQueries,
  ...tableQueries,
};

export default customQueries;
