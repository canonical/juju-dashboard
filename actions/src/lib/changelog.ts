import { util } from "@/lib";

/** Marker to indicate the start of the changelog items. */
export const CHANGELOG_START_MARKER = "<!-- changelog -->";
/** Marker to indicate the end of the changelog items. */
export const CHANGELOG_END_MARKER = "<!-- /changelog -->";

/**
 * Generate the changelog header for the provided release branch.
 */
export function changelogHeader(releaseBranch: string): string {
  return `> [!important]
> Merge this PR to open the \`${releaseBranch}\` branch, and prepare for a release.

---
`;
}

/**
 * For the provided release branch and items, generate the changelog.
 */
export function generate(releaseBranch: string, items: string[]): string {
  let changelog = changelogHeader(releaseBranch);

  changelog += "# What's changed?\n";
  changelog += `${CHANGELOG_START_MARKER}\n`;

  // TODO: Categorise changelog based on item severity.
  for (const item of items) {
    changelog += `- ${item}\n`;
  }

  changelog += `${CHANGELOG_END_MARKER}`;

  return changelog;
}

/**
 * For the provided changelog text, parse out all of the items within it.
 */
export function parse(changelog: string): string[] {
  const [_preamble, changelogEnd] = util.splitOnce(
    changelog,
    CHANGELOG_START_MARKER,
    false,
  );
  const [items, _] = util.splitOnce(changelogEnd, CHANGELOG_END_MARKER);

  const changelogItems: string[] = [];
  let currentItem = "";

  for (let item of items.trim().split("\n")) {
    // Test if the item is the start of a new bullet point.
    if (item.startsWith("- ")) {
      changelogItems.push(currentItem);
      currentItem = "";

      // Strip off the bullet point.
      item = item.slice(2);
    }

    currentItem += item.trim() + "\n";
  }

  changelogItems.push(currentItem);

  return changelogItems
    .map((item) => item.trim())
    .filter((item) => item.length > 0);
}

/**
 * Append an item to the changelog, for a release branch.
 */
export function appendItem(
  changelog: string,
  item: string,
  releaseBranch: string,
): string {
  const items = parse(changelog);
  items.push(item);
  return generate(releaseBranch, items);
}
