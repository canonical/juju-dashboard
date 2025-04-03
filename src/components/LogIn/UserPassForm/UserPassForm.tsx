import { unwrapResult } from "@reduxjs/toolkit";
import type { FormEvent } from "react";

import bakery from "juju/bakery";
import { thunks as appThunks } from "store/app";
import { actions as generalActions } from "store/general";
import { getWSControllerURL } from "store/general/selectors";
import { useAppDispatch, useAppSelector } from "store/store";
import { logger } from "utils/logger";

import { Label } from "../types";

interface LoginElements extends HTMLFormControlsCollection {
  username: HTMLInputElement;
  password: HTMLInputElement;
}

const UserPassForm = () => {
  const dispatch = useAppDispatch();
  const wsControllerURL = useAppSelector(getWSControllerURL);

  function handleSubmit(
    e: FormEvent<HTMLFormElement & { elements: LoginElements }>,
  ) {
    e.preventDefault();
    const elements = e.currentTarget.elements;
    const user = elements.username.value;
    const password = elements.password.value;
    dispatch(generalActions.cleanupLoginErrors());
    dispatch(
      generalActions.storeUserPass({
        wsControllerURL,
        credential: { user, password },
      }),
    );
    dispatch(generalActions.updateLoginLoading(true));
    if (bakery) {
      dispatch(appThunks.connectAndStartPolling())
        .then(unwrapResult)
        .catch((error) => logger.error(Label.POLLING_ERROR, error));
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <label htmlFor="username">Username</label>
      <input type="text" name="username" id="username" autoFocus />
      <label htmlFor="password">Password</label>
      <input type="password" name="password" id="password" />
      <button className="p-button--positive" type="submit">
        {Label.LOGIN_TO_DASHBOARD}
      </button>
    </form>
  );
};

export default UserPassForm;
