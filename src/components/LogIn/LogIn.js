import React from "react";
import { useSelector } from "react-redux";
import { isLoggedIn } from "app/selectors";

import logo from "static/images/logo/logo-black-on-white.svg";

import "./_login.scss";

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

  if (!userIsLoggedIn) {
    return (
      <div className="login">
        <div className="login__inner">
          <img className="login__logo" src={logo} alt="JAAS logo"></img>
          <a
            className="p-button--positive"
            href={visitURL}
            rel="noopener noreferrer"
            target="_blank"
          >
            Log in to view your models
          </a>
        </div>
      </div>
    );
  }
  return children;
};

export default LogIn;
