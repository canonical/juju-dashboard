import { useEffect, type PropsWithChildren } from "react";

type Props = {
  scrollArea?: HTMLElement | null;
} & PropsWithChildren;

const ScrollOnRender = ({ children, scrollArea }: Props) => {
  useEffect(() => {
    if (scrollArea) {
      scrollArea.scrollIntoView();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return <div>{children}</div>;
};

export default ScrollOnRender;
