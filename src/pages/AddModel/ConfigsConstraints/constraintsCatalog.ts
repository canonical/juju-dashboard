import type { ConfigFieldEntry } from "./types";

export enum ConstraintCategory {
  COMPUTE = "Compute",
  NETWORKING = "Networking & Placement",
  PLATFORM = "Platform & Image",
  STORAGE = "Storage",
  IDENTITY = "Identity & Tagging",
}

// This file is a placeholder for the constraints catalog.
// This is done since there is no way to fetch the constraints catalog from Juju currently.
// Once the constraints catalog is available, this file can be removed.
export const CONSTRAINT_DEFINITIONS: Omit<
  ConfigFieldEntry,
  "arrayIndex" | "value"
>[] = [];
