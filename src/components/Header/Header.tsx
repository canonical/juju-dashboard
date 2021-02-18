import "./_header.scss";

type Props = {
  children: JSX.Element;
};

const Header = ({ children }: Props): JSX.Element => {
  return <div className="header">{children}</div>;
};

export default Header;
