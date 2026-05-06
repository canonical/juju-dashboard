import { AccessLevel } from "types";

const ACCESS_HIERARCHY = [
  AccessLevel.READ,
  AccessLevel.WRITE,
  AccessLevel.ADMIN,
] as const;

/**
 * Increase the access level by 1.
 */
export const bumpAccessLevel = (accessLevel: AccessLevel): AccessLevel => {
  const currentIndex = ACCESS_HIERARCHY.indexOf(accessLevel);

  const higherIndex = currentIndex + 1;
  return higherIndex < ACCESS_HIERARCHY.length
    ? ACCESS_HIERARCHY[higherIndex]
    : accessLevel;
};
