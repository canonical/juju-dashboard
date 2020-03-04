import React from "react";
import { useSelector } from "react-redux";
import { isLoggedIn } from "app/selectors";

import Loader from "@canonical/react-components/dist/components/Loader";

import logo from "static/images/logo/logo-black-on-white.svg";

import useConfig from "app/use-config-hook";

import "./_login.scss";

export default function LogIn({ children }) {
  const { identityProviderAvailable } = useConfig();
  const userIsLoggedIn = useSelector(isLoggedIn);

  if (!userIsLoggedIn) {
    return (
      <>
        <div className="login">
          <div className="login__inner p-card--highlighted">
            <img className="login__logo" src={logo} alt="JAAS logo" />
            {identityProviderAvailable ? (
              <IdentityProviderForm />
            ) : (
              <UserPassForm />
            )}
          </div>
        </div>
        <main>{children}</main>
      </>
    );
  }
  return children;
}

function IdentityProviderForm() {
  const userIsLoggedIn = useSelector(isLoggedIn);

  const visitURL = useSelector(state => {
    if (!userIsLoggedIn) {
      const root = state.root;
      if (root && root.visitURL) {
        return root.visitURL;
      }
    }
  });

  return <Button visitURL={visitURL}></Button>;
}

function UserPassForm() {
  return (
    <form>
      <label htmlFor="username">Username</label>
      <input type="text" id="username" />
      <label htmlFor="password">Password</label>
      <input type="password" id="password" />
      <button className="p-button--positive" type="submit">
        Log in
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
        <Loader text="Connecting..." />
      </button>
    );
  }
}
