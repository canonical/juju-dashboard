import type { MultiSelectItem } from "@canonical/react-components";

export enum TestId {
  ACCESS_MANAGEMENT_FORM = "access-management-form",
}

export enum AccessLevel {
  ADMIN = "admin",
  READ = "read",
  WRITE = "write",
}

export type AccessUserItem = { access: string } & MultiSelectItem;
