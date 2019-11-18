import React from "react";
import { useSelector } from "react-redux";
import { isLoggedIn, isConnecting } from "app/selectors";

import logo from "static/images/logo/logo-black-on-white.svg";

import "./_login.scss";

const generateButton = (className, visitURL, label) => (
  <a
    className={className}
    href={visitURL}
    rel="noopener noreferrer"
    target="_blank"
  >
    {label}
  </a>
);

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
    ? generateButton("p-button", "_#", "Connecting...")
    : generateButton(
        "p-button--positive",
        visitURL,
        "Log in to view your models"
      );

  if (!userIsLoggedIn) {
    return (
      <>
        <div className="login">
          <div className="login__inner">
            <img className="login__logo" src={logo} alt="JAAS logo"></img>
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
