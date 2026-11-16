import type { SearchAndFilterChip } from "@canonical/react-components/dist/components/SearchAndFilter/types";

/**
  Generate the chips for a section of the search and filter.
  @param lead The heading of the section that the chips belong to.
  @param values The values to generate chips for. Duplicate values (e.g. the
    cloud shared by multiple credentials) only generate a single chip.
  @returns The unique chips, in the order that their values first appear.
*/
export const generateChips = (
  lead: string,
  values: string[],
): SearchAndFilterChip[] =>
  [...new Set(values)].map((value) => ({ lead, value }));
