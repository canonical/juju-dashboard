import React from "react";

import "./_button.scss";

const Button = props => {
  return <button className="p-button--filter">{props.children}</button>;
};

export default Button;
