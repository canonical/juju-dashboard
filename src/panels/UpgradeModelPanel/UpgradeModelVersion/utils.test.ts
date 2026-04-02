import { getRecommendedVersions } from "./utils";

it("finds the highest version and highest LTS", async () => {
  const lts = {
    date: "2006-01-02",
    lts: true,
    version: "3.6.14",
    "link-to-release": "https://github.com/juju/juju/releases/tag/v3.6.14",
    "requires-migration": true,
  };
  const latest = {
    date: "2006-01-02",
    lts: false,
    version: "4.0.1",
    "link-to-release": "https://github.com/juju/juju/releases/tag/v4.0.1",
    "requires-migration": true,
  };
  expect(
    getRecommendedVersions([
      latest,
      {
        date: "2006-01-02",
        lts: true,
        version: "3.5.14",
        "link-to-release": "https://github.com/juju/juju/releases/tag/v3.6.14",
        "requires-migration": true,
      },
      lts,
      {
        date: "2006-01-02",
        lts: false,
        version: "2.9.1",
        "link-to-release": "https://github.com/juju/juju/releases/tag/v2.9.1",
        "requires-migration": false,
      },
    ]),
  ).toStrictEqual([lts, latest]);
});
