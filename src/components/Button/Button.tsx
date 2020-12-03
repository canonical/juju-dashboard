import { ReactElement } from "react";

import "./_button.scss";

type Props = {
  onClick: () => void;
  children: string;
};

const Button = ({ onClick, children }: Props): ReactElement => {
  return (
    <button className="p-button--filter" onClick={onClick}>
      {children}
    </button>
  );
};

export default Button;
