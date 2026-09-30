import { readFile, writeFile } from "node:fs/promises";

import type { Ctx } from "@/lib";
import type { Version } from "@/lib/version";

type Section = {
  header: string;
  items: string[];
};

const VERSION_HEADER_RE = /^##\s+(.+)$/m;
const BULLET_RE = /^[-*]\s+(.*)$/;

function parseSections(content: string): { preamble: string; sections: Section[] } {
  const lines = content.split("\n");
  const preambleLines: string[] = [];
  const sections: Section[] = [];
  let current: null | Section = null;

  for (const rawLine of lines) {
    const headerMatch = rawLine.match(VERSION_HEADER_RE);
    if (headerMatch) {
      current = { header: headerMatch[1].trim(), items: [] };
      sections.push(current);
      continue;
    }

    if (current) {
      const bulletMatch = rawLine.trim().match(BULLET_RE);
      if (bulletMatch) {
        current.items.push(bulletMatch[1].trim());
      }
    } else {
      preambleLines.push(rawLine);
    }
  }

  return { preamble: preambleLines.join("\n").trimEnd(), sections };
}

function formatSections(preamble: string, sections: Section[]): string {
  const lines: string[] = [];

  if (preamble) {
    lines.push(preamble, "");
  }

  for (const { header, items } of sections) {
    lines.push(`## ${header}`);
    for (const item of items) {
      lines.push(`- ${item}`);
    }
    lines.push("");
  }

  return lines.join("\n").trimEnd() + "\n";
}

function findUnreleased(sections: Section[]): number {
  const idx = sections.findIndex((section) =>
    /^Unreleased$/i.test(section.header),
  );
  if (idx === -1) {
    throw new Error(
      "CHANGELOG.md is missing an `## Unreleased` section.",
    );
  }
  return idx;
}

function safeParseHeader(header: string): null | Version {
  // Expect header in the form [x.y.z[-identifier.number]].
  const match = /^\[(.+)\]$/.exec(header);
  if (!match) {
    return null;
  }

  const [, versionStr] = match;
  const [coreStr, preReleaseStr] = versionStr.split("-");
  const [majorStr, minorStr, patchStr] = coreStr.split(".");
  const major = majorStr === "x" ? -1 : Number(majorStr);
  const minor = minorStr === "x" ? -1 : Number(minorStr);
  const patch = patchStr === "x" ? -1 : Number(patchStr);

  if (
    major < 0 ||
    minor < 0 ||
    patch < 0 ||
    Number.isNaN(major) ||
    Number.isNaN(minor) ||
    Number.isNaN(patch)
  ) {
    return null;
  }

  let preRelease: { identifier: string; number: number } | undefined =
    undefined;
  if (preReleaseStr) {
    const [identifier, numberStr] = preReleaseStr.split(".");
    const number = Number(numberStr);
    if (identifier && !Number.isNaN(number)) {
      preRelease = { identifier, number };
    }
  }

  return { major, minor, patch, preRelease };
}

export async function readChangelog(_ctx: Ctx): Promise<string> {
  return readFile("./CHANGELOG.md", "utf-8");
}

export async function writeChangelog(
  _ctx: Ctx,
  content: string,
): Promise<void> {
  await writeFile("./CHANGELOG.md", content, "utf-8");
}

export function getUnreleasedEntries(content: string): string[] {
  const { sections } = parseSections(content);
  const idx = findUnreleased(sections);
  return [...sections[idx].items];
}

export function getVersionEntries(
  content: string,
  version: string,
): string[] {
  const { sections } = parseSections(content);
  const idx = sections.findIndex((section) => section.header === `[${version}]`);
  if (idx === -1) {
    return [];
  }
  return [...sections[idx].items];
}

export function releaseVersion(
  content: string,
  version: string,
  kind: "beta" | "stable",
): { content: string; entryItems: string[] } {
  const { preamble, sections } = parseSections(content);
  const unreleasedIdx = findUnreleased(sections);
  const entryItems = [...sections[unreleasedIdx].items];

  if (kind === "stable") {
    // Find the most recent stable section below Unreleased.
    let previousStableIdx = -1;
    for (let i = unreleasedIdx + 1; i < sections.length; i++) {
      const parsed = safeParseHeader(sections[i].header);
      if (parsed && !parsed.preRelease) {
        previousStableIdx = i;
        break;
      }
    }

    const collectUntil =
      previousStableIdx === -1 ? sections.length : previousStableIdx;

    for (let i = unreleasedIdx + 1; i < collectUntil; i++) {
      const parsed = safeParseHeader(sections[i].header);
      if (parsed?.preRelease?.identifier === "beta") {
        entryItems.push(...sections[i].items);
      }
    }
  }

  const newSection: Section = { header: `[${version}]`, items: entryItems };
  sections[unreleasedIdx].items = [];
  // Keep Unreleased at the top; insert the new version section immediately
  // after it so chronological history flows downward.
  sections.splice(unreleasedIdx + 1, 0, newSection);

  return { content: formatSections(preamble, sections), entryItems };
}

export async function finalise(
  ctx: Ctx,
  version: string,
  kind: "beta" | "stable",
): Promise<{ entryItems: string[]; newContent?: string }> {
  const content = await readChangelog(ctx);
  const existing = getVersionEntries(content, version);
  if (existing.length > 0) {
    return { entryItems: existing };
  }

  const { content: newContent, entryItems } = releaseVersion(
    content,
    version,
    kind,
  );
  await writeChangelog(ctx, newContent);
  return { entryItems, newContent };
}
