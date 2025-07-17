import { describe, it } from "vitest";

import { appendItem, generate, parse } from "./changelog";

describe("generate", () => {
  it("handles list of items", ({ expect }) => {
    const changelog = generate("# Some header\n", [
      "first feature",
      "second feature",
    ]);
    expect(changelog).toEqual(`# Some header

<!-- changelog -->
- first feature
- second feature
<!-- /changelog -->
`);
  });

  it("handles item with new line", ({ expect }) => {
    const changelog = generate("# Some header\n", [
      "first feature\nwith details",
      "second feature",
    ]);
    expect(changelog).toEqual(`# Some header

<!-- changelog -->
- first feature
with details
- second feature
<!-- /changelog -->
`);
  });

  it("handles no items", ({ expect }) => {
    const changelog = generate("# Some header\n", []);
    expect(changelog).toEqual(`# Some header

<!-- changelog -->
<!-- /changelog -->
`);
  });
});

describe("parse", () => {
  it("handles list of items", ({ expect }) => {
    const { header, items } = parse(`Header things
<!-- changelog -->
- first feature
- second feature
<!-- /changelog -->`);
    expect(header).toEqual("Header things\n");
    expect(items).toStrictEqual(["first feature", "second feature"]);
  });

  it("handles item with new line", ({ expect }) => {
    const { header, items } = parse(`Header things
<!-- changelog -->
- first feature
with details
- second feature
<!-- /changelog -->`);
    expect(header).toEqual("Header things\n");
    expect(items).toStrictEqual([
      "first feature\nwith details",
      "second feature",
    ]);
  });

  it("handles no items", ({ expect }) => {
    const { header, items } = parse(`Header things
<!-- changelog -->
<!-- /changelog -->`);
    expect(header).toEqual("Header things\n");
    expect(items).toStrictEqual([]);
  });

  it("handles content after changelog", ({ expect }) => {
    const { header, items } = parse(`Header things
<!-- changelog -->
- first feature
- second feature
<!-- /changelog -->

extra content`);
    expect(header).toEqual("Header things\n");
    expect(items).toStrictEqual(["first feature", "second feature"]);
  });
});

describe("appendItem", () => {
  it("appends an item", ({ expect }) => {
    const changelog = appendItem(
      `> [!important]
> Merge this PR to open the \`release/1.2\` branch, and prepare for a release.

---
# What's changed?
<!-- changelog -->
- first feature
- second feature
<!-- /changelog -->`,
      "third feature",
    );
    expect(changelog).toEqual(
      `> [!important]
> Merge this PR to open the \`release/1.2\` branch, and prepare for a release.

---
# What's changed?

<!-- changelog -->
- first feature
- second feature
- third feature
<!-- /changelog -->
`,
    );
  });
});
