import { AccessLevel } from "types";

import { type AccessUserItem, AddUserHint, FormatHint, Label } from "./types";

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
 * Remove a user from the share model state
 */
export const removeUser = (
  userValue: number | string,
  shareModelWith: Record<string, string>,
  activeUserName?: string,
): {
  nextShareModelWith: Record<string, string>;
  showAccessRevertToast: boolean;
} => {
  const { [userValue]: _removedUser, ...nextShareModelWith } = shareModelWith;
  let showAccessRevertToast = false;

  if (activeUserName) {
    const hasOtherAdmins = hasOtherAdmin(
      nextShareModelWith,
      activeUserName,
      activeUserName,
    );

    // Missing key means the active user is implicit admin.
    const activeUserIsAdmin =
      (nextShareModelWith[activeUserName] ?? AccessLevel.ADMIN) ===
      AccessLevel.ADMIN;
    // Ensure at least one admin remains after a removal.
    if (!activeUserIsAdmin && !hasOtherAdmins) {
      nextShareModelWith[activeUserName] = AccessLevel.ADMIN;
      showAccessRevertToast = true;
    }
  }

  return { nextShareModelWith, showAccessRevertToast };
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

  const hasOtherAdmins = hasOtherAdmin(
    shareModelWith,
    userValue,
    activeUserName,
  );

  if (userValue === activeUserName) {
    // Always disable for controller superusers
    if (activeUserControllerAccess === "superuser") {
      return Label.SUPERUSER_ACCESS_CANNOT_BE_CHANGED;
    }
    // Disable if active user is admin and there are no other admins to prevent locking themselves out.
    else if (activeUserAccess === AccessLevel.ADMIN && !hasOtherAdmins) {
      return Label.ONE_ADMIN_REQUIRED;
    } else {
      return undefined;
    }
  }

  // Disable when this row is the only admin left.
  if (shareModelWith[userValue] === AccessLevel.ADMIN && !hasOtherAdmins) {
    return Label.ONE_ADMIN_REQUIRED;
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
