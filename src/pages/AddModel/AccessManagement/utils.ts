import { AccessLevel } from "types";

import { type AccessUserItem, AddUserHint, FormatHint } from "./types";

/**
 * Check if a given user value is the active user
 */
export const isActiveUser = (
  userValue: number | string,
  activeUserName?: string,
): boolean => userValue === activeUserName;

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
 * Check if there's any non-active user with admin access
 */
export const hasNonActiveUserAdmin = (
  shareModelWith: Record<string, string>,
  activeUserName?: string,
): boolean =>
  Object.entries(shareModelWith).some(
    ([user, access]) => user !== activeUserName && access === AccessLevel.ADMIN,
  );

/**
 * Select hint text based on whether it's Juju or JIMM environment
 */
export const selectHint = (
  isJuju: boolean,
  jujuHint: string,
  jimmHint: string,
): string => (isJuju ? jujuHint : jimmHint);

/**
 * Get the appropriate hints for the current environment
 */
export const getHints = (
  isJuju: boolean,
): { addUserHint: string; formatHint: string } => ({
  addUserHint: selectHint(isJuju, AddUserHint.JUJU, AddUserHint.JIMM),
  formatHint: selectHint(isJuju, FormatHint.JUJU, FormatHint.JIMM),
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
 * Determine if a user's access level dropdown should be disabled
 * (disabled if they are the active user and no other user has admin access)
 */
export const isAccessLevelDisabled = (
  userValue: number | string,
  shareModelWith: Record<string, string>,
  activeUserControllerAccess: null | string,
  activeUserName?: string,
): boolean => {
  // Always enable for other users
  if (!isActiveUser(userValue, activeUserName)) {
    return false;
  }
  // Always disable for controller superusers
  if (activeUserControllerAccess === "superuser") {
    return true;
  }
  // Enable for active user if other admins have been added
  return !hasNonActiveUserAdmin(shareModelWith, activeUserName);
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
  isActiveUser(userValue, activeUserName)
    ? (activeUserAccess ?? AccessLevel.READ)
    : (shareModelWith[userValue] ?? AccessLevel.READ);
