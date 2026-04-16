import getMajorMinorVersion from "./getMajorMinorVersion";
import getPatchVersion from "./getPatchVersion";

const isHigherSemver = (versionA: string, versionB: string): boolean => {
  const majorMinorA = getMajorMinorVersion(versionA);
  const majorMinorB = getMajorMinorVersion(versionB);
  if (majorMinorA === null || majorMinorB === null) {
    return false;
  }
  if (majorMinorA === majorMinorB) {
    const patchA = getPatchVersion(versionA);
    const patchB = getPatchVersion(versionB);
    return patchA && patchB ? patchA > patchB : false;
  }
  return majorMinorA > majorMinorB;
};

export default isHigherSemver;
