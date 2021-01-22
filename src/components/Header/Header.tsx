import { ReactElement } from "react";

import "./_header.scss";

type Props = {
  children: JSX.Element;
};

const Header = ({ children }: Props): ReactElement => {
  return <div className="header">{children}</div>;
};

export default Header;
