import { FunctionComponent } from "react";

import "./_header.scss";

type Props = {
  children: JSX.Element;
};

const Header: FunctionComponent<Props> = ({ children }) => {
  return <div className="header">{children}</div>;
};

export default Header;
