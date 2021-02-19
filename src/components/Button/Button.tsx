import "./_button.scss";

type Props = {
  onClick: () => void;
  children: string;
};

const Button = ({ onClick, children }: Props): JSX.Element => {
  return (
    <button className="p-button--filter" onClick={onClick}>
      {children}
    </button>
  );
};

export default Button;
