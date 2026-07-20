import classNames from "classnames";
import type { ReactNode } from "react";
import type { JSX } from "react";

type Props = {
  children: ReactNode;
  className?: string;
  loading?: boolean;
};

const SkeletonPlaceholder = ({
  children,
  className,
  loading = true,
}: Props): JSX.Element => {
  const delay = Math.floor(Math.random() * 750);
  if (loading) {
    return (
      <span
        aria-hidden={true}
        className={classNames("p-placeholder", className)}
        data-testid="placeholder"
        style={{ animationDelay: `${delay}ms` }}
      />
    );
  }
  return <>{children}</>;
};

export default SkeletonPlaceholder;
