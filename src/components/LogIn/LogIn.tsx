import { connectAndStartPolling } from "app/actions";
import { actions as generalActions } from "store/general";
import {
  getConfig,
  getControllerConnections,
  getLoginError,
  getWSControllerURL,
  isLoggedIn,
} from "store/general/selectors";
import React, {
  FormEvent,
  PropsWithChildren,
  ReactNode,
  useEffect,
  useRef,
} from "react";
import { useDispatch, useSelector, useStore } from "react-redux";

import { Spinner } from "@canonical/react-components";

import { TSFixMe } from "types";
import FadeUpIn from "animations/FadeUpIn";
import bakery from "app/bakery";
import { RootState } from "store/store";

import logo from "static/images/logo/logo-black-on-white.svg";

import "./_login.scss";

export default function LogIn({ children }: PropsWithChildren<ReactNode>) {
  const config = useSelector(getConfig);

  const controllerConnections = useSelector(getControllerConnections) || {};
  const wsControllerURLs = Object.keys(controllerConnections);

  const store = useStore<RootState>();
  // Loop through all of the available controller connections to see
  // if we're logged in.
  const userIsLoggedIn = wsControllerURLs.some((wsControllerURL) =>
    isLoggedIn(store.getState(), wsControllerURL)
  );

  const loginError = useSelector(getLoginError);

  return (
    <>
      {!userIsLoggedIn && (
        <div className="login">
          <FadeUpIn isActive={!userIsLoggedIn}>
            <div className="login__inner p-card--highlighted">
              <img className="login__logo" src={logo} alt="JAAS logo" />
              {config?.identityProviderAvailable ? (
                <IdentityProviderForm userIsLoggedIn={userIsLoggedIn} />
              ) : (
                <UserPassForm />
              )}
              {generateErrorMessage(loginError)}
            </div>
          </FadeUpIn>
        </div>
      )}
      <div className="app-content">{children}</div>
    </>
  );
}

/**
  Generates the necessary elements to render the error message.
  @param loginError The error message from the store.
  @returns A component for the error message.
*/
function generateErrorMessage(loginError?: string | null) {
  if (!loginError) {
    return null;
  }
  let loginErrorMessage = null;
  switch (loginError) {
    case '"user-" is not a valid user tag':
      loginErrorMessage = "Invalid user name";
      break;
    case "invalid entity name or password":
      loginErrorMessage = "Invalid user name or password";
      break;
    default:
      loginErrorMessage = loginError;
  }
  return (
    <p className="error-message">
      <i className="p-icon--error" />
      {loginErrorMessage}
    </p>
  );
}

function IdentityProviderForm({ userIsLoggedIn }: { userIsLoggedIn: boolean }) {
  const visitURL = useSelector((state: RootState) => {
    if (!userIsLoggedIn) {
      return state?.general?.visitURL;
    }
  });

  return <Button visitURL={visitURL}></Button>;
}

interface LoginElements extends HTMLFormControlsCollection {
  username: HTMLInputElement;
  password: HTMLInputElement;
}

function UserPassForm() {
  const dispatch = useDispatch();
  const store = useStore<RootState>();
  const focus = useRef<HTMLInputElement>(null);

  function handleSubmit(
    e: FormEvent<HTMLFormElement & { elements: LoginElements }>
  ) {
    e.preventDefault();
    const elements = e.currentTarget.elements;
    const user = elements.username.value;
    const password = elements.password.value;
    dispatch(
      generalActions.storeUserPass({
        wsControllerURL: getWSControllerURL(store.getState()),
        credential: { user, password },
      })
    );
    if (bakery) {
      // TSFixMe - this override can be removed once the selectors have been
      // migrated to TypeScript.
      dispatch(connectAndStartPolling(store, bakery) as TSFixMe);
    }
  }

  useEffect(() => {
    focus.current?.focus();
  }, []);

  return (
    <form onSubmit={handleSubmit}>
      <label htmlFor="username">Username</label>
      <input type="text" name="username" id="username" ref={focus} />
      <label htmlFor="password">Password</label>
      <input type="password" name="password" id="password" />
      <button className="p-button--positive" type="submit">
        Log in to the dashboard
      </button>
    </form>
  );
}

function Button({ visitURL }: { visitURL?: string | null }) {
  if (visitURL) {
    return (
      <a
        className="p-button--positive"
        href={visitURL}
        rel="noopener noreferrer"
        target="_blank"
      >
        Log in to the dashboard
      </a>
    );
  } else {
    return (
      <button className="p-button--neutral" disabled>
        <Spinner text="Connecting..." />
      </button>
    );
  }
}
