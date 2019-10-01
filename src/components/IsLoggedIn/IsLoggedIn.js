import React from "react";
import { useSelector } from "react-redux";
import { isLoggedIn } from "app/selectors";

const IsLoggedIn = ({ children }) => {
  const isUserLoggedIn = useSelector(isLoggedIn);
  if (!isUserLoggedIn) {
    return <div>Please log in</div>;
  }
  return children;
};

export default IsLoggedIn;
