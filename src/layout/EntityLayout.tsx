import BaseLayout from "./BaseLayout/BaseLayout";

type Props = {
  children: JSX.Element;
};

export default function EntityLayout({ children }: Props) {
  return <BaseLayout>{children}</BaseLayout>;
}
