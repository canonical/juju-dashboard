import { Spinner } from "@canonical/react-components";
import type { FormEvent, PropsWithChildren } from "react";
import { useEffect, useRef } from "react";
import reactHotToast from "react-hot-toast";
import { useSelector } from "react-redux";

import FadeUpIn from "animations/FadeUpIn";
import AuthenticationButton from "components/AuthenticationButton";
import ToastCard from "components/ToastCard/ToastCard";
import bakery from "juju/bakery";
import jaasLogo from "static/images/logo/jaas-logo-black-on-white.svg";
import jujuLogo from "static/images/logo/juju-logo-black-on-white.svg";
import { thunks as appThunks } from "store/app";
import { actions as generalActions } from "store/general";
import {
  getConfig,
  getLoginError,
  getVisitURLs,
  getWSControllerURL,
  isLoggedIn,
} from "store/general/selectors";
import type { RootState } from "store/store";
import { useAppDispatch, useAppSelector } from "store/store";

import "./_login.scss";

export enum ErrorResponse {
  INVALID_TAG = '"user-" is not a valid user tag',
  INVALID_FIELD = "invalid entity name or password",
}

export enum Label {
  INVALID_NAME = "Invalid user name",
  INVALID_FIELD = "Invalid user name or password",
  JAAS_LOGO = "JAAS logo",
  JUJU_LOGO = "Juju logo",
  POLLING_ERROR = "Error when trying to connect and start polling models.",
}

export default function LogIn({ children }: PropsWithChildren) {
  const viewedAuthRequests = useRef<string[]>([]);
  const config = useSelector(getConfig);
  const isJuju = useSelector(getConfig)?.isJuju;
  const wsControllerURL = useAppSelector(getWSControllerURL);
  const userIsLoggedIn = useAppSelector((state) =>
    isLoggedIn(state, wsControllerURL)
  );
  const loginError = useAppSelector((state) =>
    getLoginError(state, wsControllerURL)
  );
  const visitURLs = useAppSelector(getVisitURLs);

  // This login component wraps all other views, so this useEffect will run each
  // time we get an authentication request.
  useEffect(() => {
    visitURLs?.forEach((visitURL) => {
      if (!viewedAuthRequests.current.includes(visitURL)) {
        reactHotToast.custom((t) => (
          <ToastCard toastInstance={t} type="caution">
            <p className="u-no-margin--top u-no-padding--top">
              Controller authentication required
            </p>
            <AuthenticationButton
              appearance="positive"
              visitURL={visitURL}
              className="u-no-margin--bottom"
              onClick={() => {
                // Close the notification once the user clicks the button to
                // open the authentication page.
                reactHotToast.remove(t.id);
              }}
            >
              Authenticate
            </AuthenticationButton>
          </ToastCard>
        ));
        // Append this to the list of auth requests that have been displayed, so
        // that we don't display the same notifications again if visitURLs is
        // mutated (e.g. if we remove a URL from the array we don't want this
        // useEffect to run again and display all the notifications again).
        viewedAuthRequests.current = [...viewedAuthRequests.current, visitURL];
      }
    });
  }, [visitURLs]);

  return (
    <>
      {!userIsLoggedIn && (
        <div className="login">
          <FadeUpIn isActive={!userIsLoggedIn}>
            <div className="login__inner p-card--highlighted">
              <img
                className="login__logo"
                src={isJuju ? jujuLogo : jaasLogo}
                alt={isJuju ? Label.JUJU_LOGO : Label.JAAS_LOGO}
              />
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
    case ErrorResponse.INVALID_TAG:
      loginErrorMessage = Label.INVALID_NAME;
      break;
    case ErrorResponse.INVALID_FIELD:
      loginErrorMessage = Label.INVALID_FIELD;
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
      // This form only gets displayed on the main login page, at which point
      // there can only be one authentication request, so just return the
      // first one.
      return state?.general?.visitURLs?.[0];
    }
  });

  return <Button visitURL={visitURL}></Button>;
}

interface LoginElements extends HTMLFormControlsCollection {
  username: HTMLInputElement;
  password: HTMLInputElement;
}

function UserPassForm() {
  const dispatch = useAppDispatch();
  const focus = useRef<HTMLInputElement>(null);
  const wsControllerURL = useAppSelector(getWSControllerURL);

  function handleSubmit(
    e: FormEvent<HTMLFormElement & { elements: LoginElements }>
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
      })
    );
    if (bakery) {
      // TODO: Consider displaying an error alert.
      dispatch(appThunks.connectAndStartPolling()).catch((error) =>
        console.error(Label.POLLING_ERROR, error)
      );
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
      <AuthenticationButton appearance="positive" visitURL={visitURL}>
        Log in to the dashboard
      </AuthenticationButton>
    );
  } else {
    return (
      <button className="p-button--neutral" disabled>
        <Spinner text="Connecting..." />
      </button>
    );
  }
}
