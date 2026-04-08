import filterBoolean from "utils/filterBoolean";
import isHigherSemver from "utils/isHigherSemver";

import type { Version } from "../types";

// TODO: replace with real API data: https://warthogs.atlassian.net/browse/JUJU-9499.
// - This list should be filtered to only display the versions that match existing controllers.
export const versions: Version[] = [
  {
    date: "2006-01-02",
    lts: false,
    version: "4.0.1",
    "link-to-release": "https://github.com/juju/juju/releases/tag/v4.0.1",
    "requires-migration": true,
  },
  {
    date: "2006-01-02",
    lts: true,
    version: "3.5.14",
    "link-to-release": "https://github.com/juju/juju/releases/tag/v3.6.14",
    "requires-migration": true,
  },
  {
    date: "2006-01-02",
    lts: true,
    version: "3.6.21",
    "link-to-release": "https://github.com/juju/juju/releases/tag/v3.6.14",
    "requires-migration": false,
  },
  {
    date: "2006-01-02",
    lts: false,
    version: "2.9.1",
    "link-to-release": "https://github.com/juju/juju/releases/tag/v2.9.1",
    "requires-migration": false,
  },
];

// Filter versions for the latest LTS and the latest stable version.
// TODO: move this to a selector once the real API data is available in Redux: https://warthogs.atlassian.net/browse/JUJU-9499.
// - This list should be filtered to only display the versions that match existing controllers.
export const getRecommendedVersions = (allVersions: Version[]): Version[] => {
  let ltsVersion: null | Version = null;
  let stableVersion: null | Version = null;
  for (const version of allVersions) {
    if (version.lts) {
      if (!ltsVersion || isHigherSemver(version.version, ltsVersion.version)) {
        ltsVersion = version;
      }
    } else if (
      !stableVersion ||
      isHigherSemver(version.version, stableVersion.version)
    ) {
      stableVersion = version;
    }
  }
  return filterBoolean([ltsVersion, stableVersion]);
};
