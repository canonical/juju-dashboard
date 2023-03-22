import { PropsWithChildren } from "react";

import { useScrollOnRender } from "hooks/useScrollOnRender";

type Props = {
  scrollArea?: HTMLElement | null;
} & PropsWithChildren;

const ScrollOnRender = ({ children, scrollArea }: Props) => {
  const onRenderRef = useScrollOnRender(scrollArea);
  return <div ref={onRenderRef}>{children}</div>;
};

export default ScrollOnRender;
