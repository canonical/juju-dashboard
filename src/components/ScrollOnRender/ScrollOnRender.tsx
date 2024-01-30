import { useEffect, type PropsWithChildren } from "react";

type Props = {
  scrollArea?: HTMLElement | null;
} & PropsWithChildren;

const ScrollOnRender = ({ children, scrollArea }: Props) => {
  useEffect(() => {
    if (scrollArea) {
      scrollArea.scrollIntoView({ behavior: "smooth" });
    }
  }, [scrollArea]);
  return <div>{children}</div>;
};

export default ScrollOnRender;
