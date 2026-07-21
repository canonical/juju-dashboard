import classNames from "classnames";
import { useMemo, type ReactNode } from "react";
import type { JSX } from "react";

type Props = {
  children: ReactNode;
  delay?: number;
  className?: string;
  loading?: boolean;
};

const SkeletonPlaceholder = ({
  children,
  delay,
  className,
  loading = true,
}: Props): JSX.Element => {
  const animationDelay = useMemo(
    () => delay ?? Math.floor(Math.random() * 750),
    [delay],
  );

  if (loading) {
    return (
      <span
        aria-hidden={true}
        className={classNames("p-placeholder", className)}
        data-testid="placeholder"
        style={{ animationDelay: `${animationDelay}ms` }}
      />
    );
  }
  return <>{children}</>;
};

export default SkeletonPlaceholder;
