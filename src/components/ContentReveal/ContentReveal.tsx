import { useState } from "react";

import "./_content-reveal.scss";

type Props = {
  title: string | JSX.Element;
  children: JSX.Element;
  showContent: boolean;
};

export default function ContentReveal({ title, showContent, children }: Props) {
  const [isOpen, setIsOpen] = useState(showContent);

  function handleToggle() {
    setIsOpen(!isOpen);
  }

  const iconName = isOpen ? "minus" : "plus";

  return (
    <div className="content-reveal">
      <div
        className="content-reveal__header"
        onClick={() => handleToggle()}
        onKeyDown={() => handleToggle()}
        role="button"
        tabIndex={0}
      >
        <i className={`p-icon--${iconName}`}></i>
        <div className="content-reveal__title">{title}</div>
      </div>
      <div className="content-reveal__content" aria-hidden={!isOpen}>
        {children}
      </div>
    </div>
  );
}
