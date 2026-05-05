import { describe, it, expect } from "vitest";

import { AccessLevel } from "types";

import { AddUserHint, FormatHint } from "./types";
import {
  buildActiveUser,
  buildSelectedItems,
  getHints,
  getUserAccess,
  hasNonActiveUserAdmin,
  isAccessLevelDisabled,
  isActiveUser,
  removeUser,
  selectHint,
} from "./utils";

describe("AccessManagement utils", () => {
  describe("isActiveUser", () => {
    it("returns true when userValue matches activeUserName", () => {
      expect(isActiveUser("user@example.com", "user@example.com")).toBe(true);
    });

    it("returns false when userValue does not match activeUserName", () => {
      expect(isActiveUser("other@example.com", "user@example.com")).toBe(false);
    });

    it("returns false when activeUserName is undefined", () => {
      expect(isActiveUser("user@example.com", undefined)).toBe(false);
    });
  });

  describe("buildActiveUser", () => {
    it("returns undefined when activeUserName is undefined", () => {
      expect(buildActiveUser(undefined, {})).toBeUndefined();
    });

    it("builds active user object with ADMIN access when not in shareModelWith", () => {
      const result = buildActiveUser("user@example.com", {});
      expect(result).toEqual({
        label: "user@example.com",
        value: "user@example.com",
        access: AccessLevel.ADMIN,
      });
    });

    it("builds active user object with existing access level from shareModelWith", () => {
      const result = buildActiveUser("user@example.com", {
        "user@example.com": AccessLevel.READ,
      });
      expect(result).toEqual({
        label: "user@example.com",
        value: "user@example.com",
        access: AccessLevel.READ,
      });
    });
  });

  describe("buildSelectedItems", () => {
    it("returns empty array when activeUser is undefined and shareModelWith is empty", () => {
      expect(buildSelectedItems(undefined, {})).toEqual([]);
    });

    it("includes active users as first item and other users from shareModelWith", () => {
      const activeUser = {
        label: "user@example.com",
        value: "user@example.com",
        access: AccessLevel.ADMIN,
      };
      const result = buildSelectedItems(
        activeUser,
        {
          "user@example.com": AccessLevel.ADMIN,
          "other@example.com": AccessLevel.READ,
        },
        "user@example.com",
      );
      expect(result[0]).toEqual(activeUser);
      expect(result).toHaveLength(2);
      expect(result[1]).toEqual({
        label: "other@example.com",
        value: "other@example.com",
        access: AccessLevel.READ,
      });
    });

    it("returns only other users when activeUser is undefined", () => {
      const result = buildSelectedItems(
        undefined,
        {
          "user1@example.com": AccessLevel.ADMIN,
          "user2@example.com": AccessLevel.READ,
        },
        "active@example.com",
      );
      expect(result).toHaveLength(2);
      expect(result[0].value).toBe("user1@example.com");
      expect(result[1].value).toBe("user2@example.com");
    });
  });

  describe("hasNonActiveUserAdmin", () => {
    it("returns false when shareModelWith is empty", () => {
      expect(hasNonActiveUserAdmin({}, "user@example.com")).toBe(false);
    });

    it("returns true when another user has admin access", () => {
      expect(
        hasNonActiveUserAdmin(
          {
            "user@example.com": AccessLevel.READ,
            "other@example.com": AccessLevel.ADMIN,
          },
          "user@example.com",
        ),
      ).toBe(true);
    });

    it("returns false when other users have non-admin access", () => {
      expect(
        hasNonActiveUserAdmin(
          {
            "user@example.com": AccessLevel.ADMIN,
            "other1@example.com": AccessLevel.READ,
            "other2@example.com": AccessLevel.WRITE,
          },
          "user@example.com",
        ),
      ).toBe(false);
    });
  });

  describe("selectHint", () => {
    it("returns first hint when isJuju is true", () => {
      const result = selectHint(true, "Juju Text", "JIMM Text");
      expect(result).toBe("Juju Text");
    });

    it("returns second hint when isJuju is false", () => {
      const result = selectHint(false, "Juju Text", "JIMM Text");
      expect(result).toBe("JIMM Text");
    });
  });

  describe("getHints", () => {
    it("returns Juju hints when isJuju is true", () => {
      const result = getHints(true);
      expect(result.addUserHint).toBe(AddUserHint.JUJU);
      expect(result.formatHint).toBe(FormatHint.JUJU);
    });

    it("returns JIMM hints when isJuju is false", () => {
      const result = getHints(false);
      expect(result.addUserHint).toBe(AddUserHint.JIMM);
      expect(result.formatHint).toBe(FormatHint.JIMM);
    });
  });

  describe("removeUser", () => {
    it("removes user from shareModelWith", () => {
      const shareModelWith = {
        "user@example.com": AccessLevel.ADMIN,
        "user1@example.com": AccessLevel.ADMIN,
        "user2@example.com": AccessLevel.READ,
      };
      const result = removeUser(
        "user1@example.com",
        shareModelWith,
        "user@example.com",
      );
      expect(result).toEqual({
        "user@example.com": AccessLevel.ADMIN,
        "user2@example.com": AccessLevel.READ,
      });
    });

    it("handles removing non-existent user", () => {
      const shareModelWith = {
        "user1@example.com": AccessLevel.ADMIN,
      };
      const result = removeUser(
        "nonexistent@example.com",
        shareModelWith,
        "user1@example.com",
      );
      expect(result).toEqual({
        "user1@example.com": AccessLevel.ADMIN,
      });
    });

    it("resets last remaining user to admin when all others are removed", () => {
      const shareModelWith = {
        "user1@example.com": AccessLevel.ADMIN,
        "user2@example.com": AccessLevel.READ,
      };
      const result = removeUser(
        "user1@example.com",
        shareModelWith,
        "user2@example.com",
      );
      expect(result).toEqual({
        "user2@example.com": AccessLevel.ADMIN,
      });
    });
  });

  describe("isAccessLevelDisabled", () => {
    it("returns true when active user is controller superuser", () => {
      const result = isAccessLevelDisabled(
        "user@example.com",
        {
          "user@example.com": AccessLevel.READ,
          "other@example.com": AccessLevel.ADMIN,
        },
        "superuser",
        true,
        "user@example.com",
      );
      expect(result).toBe(true);
    });

    it("returns true when active user is not superuser and no other admin exists", () => {
      const result = isAccessLevelDisabled(
        "user@example.com",
        {
          "user@example.com": AccessLevel.READ,
          "other@example.com": AccessLevel.READ,
        },
        "admin",
        true,
        "user@example.com",
      );
      expect(result).toBe(true);
    });

    it("returns false when active user is not superuser and another admin exists", () => {
      const result = isAccessLevelDisabled(
        "user@example.com",
        {
          "user@example.com": AccessLevel.READ,
          "other@example.com": AccessLevel.ADMIN,
        },
        "admin",
        true,
        "user@example.com",
      );
      expect(result).toBe(false);
    });

    it("returns true for active user on JIMM, even when another admin exists", () => {
      const result = isAccessLevelDisabled(
        "user@example.com",
        {
          "user@example.com": AccessLevel.READ,
          "other@example.com": AccessLevel.ADMIN,
        },
        "admin",
        false,
        "user@example.com",
      );
      expect(result).toBe(true);
    });

    it("returns false when user is not active", () => {
      const result = isAccessLevelDisabled(
        "other@example.com",
        {
          "user@example.com": AccessLevel.ADMIN,
          "other@example.com": AccessLevel.READ,
        },
        "superuser",
        true,
        "user@example.com",
      );
      expect(result).toBe(false);
    });
  });

  describe("getUserAccess", () => {
    it("returns activeUserAccess when user is active", () => {
      const result = getUserAccess(
        "user@example.com",
        "user@example.com",
        AccessLevel.WRITE,
        {},
      );
      expect(result).toBe(AccessLevel.WRITE);
    });

    it("returns READ when user is active but activeUserAccess is undefined", () => {
      const result = getUserAccess(
        "user@example.com",
        "user@example.com",
        undefined,
        {},
      );
      expect(result).toBe(AccessLevel.READ);
    });

    it("returns user access from shareModelWith when user is not active", () => {
      const result = getUserAccess(
        "other@example.com",
        "user@example.com",
        AccessLevel.ADMIN,
        {
          "other@example.com": AccessLevel.WRITE,
        },
      );
      expect(result).toBe(AccessLevel.WRITE);
    });

    it("returns READ when user is not active and not in shareModelWith", () => {
      const result = getUserAccess(
        "other@example.com",
        "user@example.com",
        AccessLevel.ADMIN,
        {},
      );
      expect(result).toBe(AccessLevel.READ);
    });
  });
});
