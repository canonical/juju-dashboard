import { Button, FormikField, Input } from "@canonical/react-components";
import { Formik, Form } from "formik";
import { useEffect, useState } from "react";

import { login } from "components/LogIn/UserPassForm";
import useLocalStorage from "hooks/useLocalStorage";
import {
  getIsJuju,
  getWSControllerURL,
  isLoggedIn,
} from "store/general/selectors";
import { useAppDispatch, useAppSelector } from "store/store";

import { StatusTitle } from "./StatusTitle";
import type { Widget } from "./types";
import { sendToast } from "./utils";

const USER_CREDENTIALS_KEY = "DEV__user-credentials";
const AUTO_LOGIN_KEY = "DEV__auto-login";

export default {
  Title: () => {
    const wsControllerURL = useAppSelector(getWSControllerURL);
    const userIsLoggedIn = useAppSelector((state) =>
      isLoggedIn(state, wsControllerURL),
    );

    return (
      <StatusTitle
        title="Juju User"
        status={userIsLoggedIn}
        label={userIsLoggedIn ? "Logged in" : "Logged out"}
      />
    );
  },
  Widget: () => {
    const isJuju = useAppSelector(getIsJuju);
    const wsControllerURL = useAppSelector(getWSControllerURL);

    const [credential, setCredential] = useLocalStorage(USER_CREDENTIALS_KEY, {
      user: "",
      password: "",
    });
    const [autoLogin, setAutoLogin] = useLocalStorage(AUTO_LOGIN_KEY, false);

    useAutoLogin(autoLogin, wsControllerURL, credential);

    function saveUserCredentials(userCredential: {
      user: string;
      password: string;
    }) {
      setCredential(userCredential);
      sendToast("Saved user credentials");
    }

    if (!isJuju) {
      return null;
    }

    return (
      <>
        <p>
          Enter a local user's username and password to automatically login.
          This will save the user's credentials in local storage.
        </p>
        <Formik initialValues={credential} onSubmit={saveUserCredentials}>
          <Form>
            <FormikField
              type="text"
              name="user"
              label="Username"
              placeholder="admin"
            />
            <FormikField
              type="password"
              name="password"
              label="Password"
              placeholder="•••••"
            />

            <div className="dev-bar__form-controls">
              <Input
                type="checkbox"
                label="Auto Login"
                checked={autoLogin}
                onChange={(ev) => setAutoLogin(ev.target.checked)}
              />

              <Button type="submit">Save</Button>
            </div>
          </Form>
        </Formik>
      </>
    );
  },
} satisfies Widget;

function useAutoLogin(
  enabled: boolean,
  wsControllerURL: null | string,
  credential: { user: string; password: string },
) {
  const dispatch = useAppDispatch();
  const userIsLoggedIn = useAppSelector((state) =>
    isLoggedIn(state, wsControllerURL),
  );
  const [attempted, setAttempted] = useState(false);

  useEffect(() => {
    if (enabled) {
      setAttempted(false);
    }
  }, [enabled]);

  useEffect(() => {
    if (enabled && !attempted && !userIsLoggedIn) {
      setAttempted(true);
      login(dispatch, wsControllerURL, credential);
      sendToast("Automatically logged in.");
    }
  }, [
    enabled,
    attempted,
    userIsLoggedIn,
    dispatch,
    wsControllerURL,
    credential,
  ]);
}
