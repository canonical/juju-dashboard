import getMajorMinorVersion from "./getMajorMinorVersion";
import getPatchVersion from "./getPatchVersion";

const isHigherSemver = (
  versionA: string,
  versionB: string,
  orEqual = false,
): boolean => {
  const majorMinorA = getMajorMinorVersion(versionA);
  const majorMinorB = getMajorMinorVersion(versionB);
  if (majorMinorA === null || majorMinorB === null) {
    return false;
  }
  if (majorMinorA === majorMinorB) {
    const patchA = getPatchVersion(versionA);
    const patchB = getPatchVersion(versionB);
    if (patchA === null || patchB === null) {
      return false;
    }
    return orEqual ? patchA >= patchB : patchA > patchB;
  }
  return majorMinorA > majorMinorB;
};

export default isHigherSemver;
