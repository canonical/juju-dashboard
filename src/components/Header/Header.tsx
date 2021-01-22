import "./_header.scss";

type Props = {
  children: JSX.Element;
};

const Header = ({ children }: Props) => {
  return <div className="header">{children}</div>;
};

export default Header;
