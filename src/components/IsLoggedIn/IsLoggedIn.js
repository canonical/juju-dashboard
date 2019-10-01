import React from "react";
import { useSelector } from "react-redux";
import { isLoggedIn } from "app/selectors";

const IsLoggedIn = ({ children }) => {
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
      <div>
        Please{" "}
        <a href={visitURL} rel="noopener noreferrer" target="_blank">
          log in
        </a>
      </div>
    );
  }
  return children;
};

export default IsLoggedIn;
