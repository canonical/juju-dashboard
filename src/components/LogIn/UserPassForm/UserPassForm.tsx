import type { FC, FormEvent } from "react";

import { getWSControllerURL } from "store/general/selectors";
import { useAppDispatch, useAppSelector } from "store/store";

import { Label } from "../types";

import { login } from "./login";

interface LoginElements extends HTMLFormControlsCollection {
  username: HTMLInputElement;
  password: HTMLInputElement;
}

const UserPassForm: FC = () => {
  const dispatch = useAppDispatch();
  const wsControllerURL = useAppSelector(getWSControllerURL);

  function handleSubmit(
    ev: FormEvent<{ elements: LoginElements } & HTMLFormElement>,
  ): void {
    ev.preventDefault();
    const { elements } = ev.currentTarget;
    const user = elements.username.value;
    const password = elements.password.value;
    login(dispatch, wsControllerURL, { user, password });
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
