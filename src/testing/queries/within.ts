import { within } from "@testing-library/react";

import queries from "./queries";

export const customWithin = (element: HTMLElement) => within(element, queries);
