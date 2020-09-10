import React, { useEffect, useRef } from "react";
import { useDispatch, useSelector, useStore } from "react-redux";
import {
  isLoggedIn,
  getBakery,
  getConfig,
  getLoginError,
  getControllerConnections,
  getWSControllerURL,
} from "app/selectors";
import { connectAndStartPolling, storeUserPass } from "app/actions";

import Spinner from "@canonical/react-components/dist/components/Spinner";

import logo from "static/images/logo/logo-black-on-white.svg";

import "./_login.scss";

export default function LogIn({ children }) {
  const { identityProviderAvailable } = useSelector(getConfig);

  const controllerConnections = useSelector(getControllerConnections) || {};
  const wsControllerURLs = Object.keys(controllerConnections);

  const store = useStore();
  // Loop through all of the available controller connections to see
  // if we're logged in.
  const userIsLoggedIn = wsControllerURLs.some((wsControllerURL) =>
    isLoggedIn(wsControllerURL, store.getState())
  );

  const loginError = useSelector(getLoginError);

  return (
    <>
      {!userIsLoggedIn ? (
        <div className="login">
          <div className="login__inner p-card--highlighted">
            <img className="login__logo" src={logo} alt="JAAS logo" />
            {identityProviderAvailable ? (
              <IdentityProviderForm userIsLoggedIn={userIsLoggedIn} />
            ) : (
              <UserPassForm />
            )}
            {generateErrorMessage(loginError)}
          </div>
        </div>
      ) : null}
      {children}
    </>
  );
}

/**
  Generates the necessary elements to render the error message.
  @param {String} loginError The error message from the store.
  @returns {Object} A component for the error message.
*/
function generateErrorMessage(loginError) {
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

function IdentityProviderForm({ userIsLoggedIn }) {
  const visitURL = useSelector((state) => {
    if (!userIsLoggedIn) {
      return state?.root?.visitURL;
    }
  });

  return <Button visitURL={visitURL}></Button>;
}

function UserPassForm() {
  const dispatch = useDispatch();
  const store = useStore();
  const bakery = useSelector(getBakery);
  const focus = useRef();

  function handleSubmit(e) {
    e.preventDefault();
    const elements = e.currentTarget.elements;
    const user = elements.username.value;
    const password = elements.password.value;
    dispatch(
      storeUserPass(getWSControllerURL(store.getState()), { user, password })
    );
    dispatch(connectAndStartPolling(store, bakery));
  }

  useEffect(() => {
    focus.current.focus();
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

function Button({ visitURL }) {
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
