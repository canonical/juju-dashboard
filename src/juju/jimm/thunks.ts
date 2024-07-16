import type { LoginResult } from "@canonical/jujulib/dist/api/facades/admin/AdminV3";
import { createAsyncThunk } from "@reduxjs/toolkit";

import type { RootState } from "store/store";
import { toErrorString } from "utils";

import { endpoints } from "./api";

/**
  Log out of the JIMM API.
*/
export const logout = createAsyncThunk<
  void,
  void,
  {
    state: RootState;
  }
>("jimm/logout", async () => {
  try {
    const response = await fetch(endpoints.logout);
    if (!response.ok) {
      throw new Error("non-success response");
    }
  } catch (error) {
    throw new Error(`Unable to log out: ${toErrorString(error)}`);
  }
});

/**
  Get the authenticated user from the JIMM API.
*/
export const whoami = createAsyncThunk<
  LoginResult | null,
  void,
  {
    state: RootState;
  }
>("jimm/whoami", async () => {
  try {
    const response = await fetch(endpoints.whoami);
    if (response.status === 401 || response.status === 403) {
      // The user is not authenticated so return null instead of throwing an error.
      return null;
    }
    if (!response.ok) {
      throw new Error("non-success response");
    }
    return await response.json();
  } catch (error) {
    throw new Error(`Unable to get user details: ${toErrorString(error)}`);
  }
});
