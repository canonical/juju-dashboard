import type { MultiSelectItem } from "@canonical/react-components";

export enum TestId {
  ACCESS_MANAGEMENT_FORM = "access-management-form",
}

export enum AddUserHint {
  JUJU = "Add users by entering a username",
  JIMM = "Add users by entering an email address",
}

export enum FormatHint {
  JUJU = "Make sure the username is correct",
  JIMM = "Make sure the email format is correct",
}

export enum Label {
  MULTI_SELECT_LABEL = "Add users",
  MULTI_SELECT_PLACEHOLDER = "Search and add users",
  MULTI_SELECT_NO_USERS = "No users found",
  HEADER_USER_NAME = "User Name",
  HEADER_ACCESS_LEVEL = "Access Level",
  BUTTON_DELETE = "Delete",
  ONE_ADMIN_REQUIRED = "You cannot change access. At least one admin required per model.",
  ACCESS_CANNOT_BE_CHANGED = "Model owner access cannot be changed.",
  SUPERUSER_ACCESS_CANNOT_BE_CHANGED = "Controller superusers cannot change their own model access.",
}

export type AccessUserItem = { access: string } & MultiSelectItem;
