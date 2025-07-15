export type Version = {
  major: number;
  minor: number;
  patch: number;
  preRelease?: {
    identifier: string;
    number: number;
  };
};

/**
 * Parses a version in the form of `major.minor.patch[-identifier.number]`. Will substitute `x`
 * with `-1` in the `major`, `minor`, and `patch` fields.
 */
export function parseVersion(version: string): Version {
  const [coreStr, preReleaseStr] = version.split("-");
  const [major, minor, patch] = coreStr
    .split(".")
    .map((component) => (component === "x" ? -1 : Number(component)));

  let preRelease: { identifier: string; number: number } | undefined;
  if (preReleaseStr) {
    const [identifier, number] = preReleaseStr.split(".");
    preRelease = {
      identifier,
      number: Number(number),
    };
  }

  return {
    major,
    minor,
    patch,
    preRelease,
  };
}

export function serialiseVersion(version: Version): string {
  let versionStr = [version.major, version.minor, version.patch].join(".");

  if (version.preRelease) {
    versionStr += `-${version.preRelease.identifier}.${version.preRelease.number}`;
  }

  return versionStr;
}
