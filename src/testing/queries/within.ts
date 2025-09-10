import type { BoundFunctions } from "@testing-library/react";
import { within } from "@testing-library/react";

import queries from "./queries";

export const customWithin = (
  element: HTMLElement,
): BoundFunctions<typeof queries> => within(element, queries);
