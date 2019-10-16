import React from "react";

import "./_button.scss";

const Button = ({ onClick, children }) => {
  return (
    <button className="p-button--filter" onClick={onClick}>
      {children}
    </button>
  );
};

export default Button;
