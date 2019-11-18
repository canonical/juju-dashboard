import React from "react";
import { useSelector } from "react-redux";
import { isLoggedIn, isConnecting } from "app/selectors";

import logo from "static/images/logo/logo-black-on-white.svg";

import "./_login.scss";

const generateButton = visitURL => {
  if (visitURL) {
    return (
      <a
        className="p-button--positive"
        href={visitURL}
        rel="noopener noreferrer"
        target="_blank"
      >
        Log in to view your models
      </a>
    );
  } else {
    return (
      <button className="p-button--neutral" disabled>
        Connecting...
      </button>
    );
  }
};

const LogIn = ({ children }) => {
  const userIsLoggedIn = useSelector(isLoggedIn);
  const visitURL = useSelector(state => {
    if (!userIsLoggedIn) {
      const root = state.root;
      if (root && root.visitURL) {
        return root.visitURL;
      }
    }
  });

  const button = !useSelector(isConnecting)
    ? generateButton()
    : generateButton(visitURL);

  if (!userIsLoggedIn) {
    return (
      <>
        <div className="login">
          <div className="login__inner p-card--highlighted">
            <img className="login__logo" src={logo} alt="JAAS logo" />
            {button}
          </div>
        </div>
        <main>{children}</main>
      </>
    );
  }
  return children;
};

export default LogIn;
