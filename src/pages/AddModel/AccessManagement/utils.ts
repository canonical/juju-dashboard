import { AccessLevel } from "types";

import { type AccessUserItem, AddUserHint, FormatHint } from "./types";

/**
 * Build the ACTIVE_USER object from active username and current share state
 */
export const buildActiveUser = (
  activeUserName: string | undefined,
  shareModelWith: Record<string, string>,
): AccessUserItem | undefined => {
  if (!activeUserName) {
    return undefined;
  }
  return {
    label: activeUserName,
    value: activeUserName,
    access: shareModelWith[activeUserName] ?? AccessLevel.ADMIN,
  };
};

/**
 * Build the complete list of selected items (active user + other users)
 */
export const buildSelectedItems = (
  activeUser: AccessUserItem | undefined,
  shareModelWith: Record<string, string>,
  activeUserName?: string,
): AccessUserItem[] => {
  return [
    ...(activeUser ? [activeUser] : []),
    ...Object.entries(shareModelWith)
      .filter(([user]) => user !== activeUserName)
      .map(([user, access]) => ({
        label: user,
        value: user,
        access,
      })),
  ];
};

/**
 * Get the appropriate hints for the current environment
 */
export const getHints = (
  isJuju: boolean,
): { addUserHint: string; formatHint: string } => ({
  addUserHint: isJuju ? AddUserHint.JUJU : AddUserHint.JIMM,
  formatHint: isJuju ? FormatHint.JUJU : FormatHint.JIMM,
});

/**
 * Remove a user from the share model state
 */
export const removeUser = (
  userValue: number | string,
  shareModelWith: Record<string, string>,
  activeUserName: string | undefined,
): Record<string, string> => {
  const { [userValue]: _removedUser, ...nextShareModelWith } = shareModelWith;

  // If only one user remains after removal, set them to admin
  if (Object.keys(nextShareModelWith).length === 1 && activeUserName) {
    // Since the active user cannot be removed, the last user will always be the active user
    nextShareModelWith[activeUserName] = AccessLevel.ADMIN;
  }

  return nextShareModelWith;
};

/**
 * Check if there is at least one other admin besides the given user
 */
export const hasOtherAdmin = (
  shareModelWith: Record<string, string>,
  userValue: number | string,
  activeUserName?: string,
): boolean => {
  const effectiveShareModelWith =
    activeUserName && !(activeUserName in shareModelWith)
      ? { ...shareModelWith, [activeUserName]: AccessLevel.ADMIN }
      : shareModelWith;

  return Object.entries(effectiveShareModelWith).some(
    ([user, access]) => user !== userValue && access === AccessLevel.ADMIN,
  );
};

/**
 * Determine if a user's access level dropdown should be disabled and return an appropriate message
 */
export const getAccessLevelDisabledReason = (
  userValue: number | string,
  shareModelWith: Record<string, string>,
  activeUserControllerAccess: null | string,
  isJuju?: boolean,
  activeUserName?: string,
): string | undefined => {
  const activeUserAccess = activeUserName
    ? (shareModelWith[activeUserName] ?? AccessLevel.ADMIN)
    : undefined;
  const currentUserAccess =
    userValue === activeUserName ? activeUserAccess : shareModelWith[userValue];

  const hasOtherAdmins = hasOtherAdmin(
    shareModelWith,
    userValue,
    activeUserName,
  );

  // Disable when this row is the only admin left.
  if (currentUserAccess === AccessLevel.ADMIN && !hasOtherAdmins) {
    return "At least one admin must remain with admin access.";
  }

  if (userValue === activeUserName) {
    // Temporarily disable for JIMM as access reduction for active user needs correction
    // TODO: enable the option for JIMM once the JIMM issue has been fixed:
    // https://warthogs.atlassian.net/browse/JUJU-9822.
    if (!isJuju) {
      return "Model owner access cannot be changed.";
    }
    // Always disable for controller superusers
    else if (activeUserControllerAccess === "superuser") {
      return "Controller superusers cannot change their own model access.";
    } else {
      return undefined;
    }
  }

  return undefined;
};

/**
 * Get the current access level for a user
 */
export const getUserAccess = (
  userValue: number | string,
  activeUserName: string | undefined,
  activeUserAccess: string | undefined,
  shareModelWith: Record<string, string>,
): string =>
  (userValue === activeUserName
    ? activeUserAccess
    : shareModelWith[userValue]) ?? AccessLevel.READ;
