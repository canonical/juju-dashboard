import { util } from "@/lib";

/** Marker to indicate the start of the changelog items. */
export const CHANGELOG_START_MARKER = "<!-- changelog -->";
/** Marker to indicate the end of the changelog items. */
export const CHANGELOG_END_MARKER = "<!-- /changelog -->";

/**
 * For the provided release branch and items, generate the changelog.
 */
export function generate(header: string, items: string[]): string {
  let changelog = header;

  changelog += `\n${CHANGELOG_START_MARKER}\n`;

  // TODO: Categorise changelog based on item severity.
  for (const item of items) {
    changelog += `- ${item}\n`;
  }

  changelog += `${CHANGELOG_END_MARKER}\n`;

  return changelog;
}

/**
 * For the provided changelog text, parse out all of the items within it.
 */
export function parse(changelog: string): {
  header: string;
  items: string[];
} {
  const [header, changelogEnd] = util.splitOnce(
    changelog,
    CHANGELOG_START_MARKER,
    false,
  );
  const [changelogItems, _] = util.splitOnce(
    changelogEnd,
    CHANGELOG_END_MARKER,
  );

  const items: string[] = [];
  let currentItem = "";

  for (let item of changelogItems.trim().split("\n")) {
    // Test if the item is the start of a new bullet point.
    if (item.startsWith("- ")) {
      items.push(currentItem);
      currentItem = "";

      // Strip off the bullet point.
      item = item.slice(2);
    }

    currentItem += item.trim() + "\n";
  }

  items.push(currentItem);

  return {
    items: items.map((item) => item.trim()).filter((item) => item.length > 0),
    header,
  };
}

/**
 * Append an item to the changelog, for a release branch.
 */
export function appendItem(changelog: string, item: string): string {
  const { header, items } = parse(changelog);
  items.push(item);
  return generate(header, items);
}
