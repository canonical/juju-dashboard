import React, { useEffect, useRef } from "react";
import { useDispatch, useSelector, useStore } from "react-redux";
import { isLoggedIn, getBakery } from "app/selectors";
import { connectAndStartPolling, storeUserPass } from "app/actions";

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
  const dispatch = useDispatch();
  const store = useStore();
  const bakery = useSelector(getBakery);
  const focus = useRef();

  function handleSubmit(e) {
    e.preventDefault();
    const elements = e.currentTarget.elements;
    const user = elements.username.value;
    const password = elements.password.value;
    dispatch(storeUserPass({ user, password }));
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
