import { getMajorMinorVersion } from "utils";
import getPatchVersion from "utils/getPatchVersion";

// See the release notes for the list of LTS releases:
// https://documentation.ubuntu.com/juju/latest/releasenotes/.
// Note this list does not include LTS releases older than 3.6 as they are not
// supported by the dashboard's upgrade features.
const LTS_RELEASES = [3.6];

/**
 * Check whether a Juju release is an LTS.
 */
export const isLTS = (version: string): boolean => {
  const majorMinor = getMajorMinorVersion(version);
  return majorMinor ? LTS_RELEASES.includes(majorMinor) : false;
};

/**
 * Check whether an upgrade will require a controller migration. A model needs
 * to migrate to a new controller if:
 * - the major or minor version has changed, or
 * - the patch version is higher than its current controller's patch version.
 * See: https://documentation.ubuntu.com/juju/3.6/reference/upgrading-things/
 */
export const requiresMigration = (
  controllerVersion: string,
  upgradeVersion: string,
): boolean => {
  const upgradeMajorMinor = getMajorMinorVersion(upgradeVersion);
  const controllerMajorMinor = getMajorMinorVersion(controllerVersion);
  const upgradePatch = getPatchVersion(upgradeVersion);
  const controllerPatch = getPatchVersion(controllerVersion);
  if (
    upgradeMajorMinor === null ||
    controllerMajorMinor === null ||
    upgradePatch === null ||
    controllerPatch === null
  ) {
    return false;
  }
  return (
    upgradeMajorMinor !== controllerMajorMinor || upgradePatch > controllerPatch
  );
};
