import { Spinner } from "@canonical/react-components";
import type { ReactNode } from "react";
import { useEffect, useRef } from "react";
import reactHotToast from "react-hot-toast";
import { Outlet } from "react-router";

import FadeUpIn from "animations/FadeUpIn";
import { Auth, AuthMethod } from "auth";
import AuthenticationButton from "components/AuthenticationButton";
import Logo from "components/Logo";
import ToastCard from "components/ToastCard";
import type { ToastInstance } from "components/ToastCard";
import {
  getLoginError,
  getVisitURLs,
  getWSControllerURL,
  isLoggedIn,
  getIsJuju,
  getLoginLoading,
} from "store/general/selectors";
import { useAppSelector } from "store/store";

import IdentityProviderForm from "./IdentityProviderForm";
import OIDCForm from "./OIDCForm";
import UserPassForm from "./UserPassForm";
import { ErrorResponse, Label, TestId } from "./types";

export default function LogIn() {
  const viewedAuthRequests = useRef<string[]>([]);
  const isJuju = useAppSelector(getIsJuju);
  const wsControllerURL = useAppSelector(getWSControllerURL);
  const userIsLoggedIn = useAppSelector((state) =>
    isLoggedIn(state, wsControllerURL),
  );
  const loginError = useAppSelector((state) =>
    getLoginError(state, wsControllerURL),
  );
  const visitURLs = useAppSelector(getVisitURLs);
  const loginLoading = useAppSelector(getLoginLoading);

  // This login component wraps all other views, so this useEffect will run each
  // time we get an authentication request.
  useEffect(() => {
    visitURLs?.forEach((visitURL) => {
      if (!viewedAuthRequests.current.includes(visitURL)) {
        reactHotToast.custom((t: ToastInstance) => (
          <ToastCard toastInstance={t} type="caution">
            <p className="u-no-margin--top u-no-padding--top">
              {Label.AUTH_REQUIRED}
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
              {Label.AUTHENTICATE}
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

  let form: ReactNode = null;
  if (loginLoading) {
    form = (
      <button className="p-button--neutral" disabled>
        <Spinner text="Connecting..." />
      </button>
    );
  } else {
    switch (Auth.instance.name) {
      case AuthMethod.CANDID:
        form = <IdentityProviderForm userIsLoggedIn={userIsLoggedIn} />;
        break;
      case AuthMethod.OIDC:
        form = <OIDCForm />;
        break;
      default:
        form = <UserPassForm />;
        break;
    }
  }

  return (
    <>
      {!userIsLoggedIn && (
        <div className="login" data-testid={TestId.LOGIN_FORM}>
          <FadeUpIn isActive={!userIsLoggedIn}>
            <div className="login__inner p-card--highlighted">
              <Logo className="login__logo" dark isJuju={isJuju} />
              {form}
              {generateErrorMessage(loginError)}
            </div>
          </FadeUpIn>
        </div>
      )}
      <div className="app-content">
        <Outlet />
      </div>
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
