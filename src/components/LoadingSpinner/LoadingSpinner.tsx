import type { PropsWithSpread } from "@canonical/react-components";
import { Spinner } from "@canonical/react-components";
import classNames from "classnames";
import type { HTMLProps } from "react";

import "./_loading-spinner.scss";

export enum TestId {
  LOADING = "loading-spinner",
}

type Props = PropsWithSpread<{}, HTMLProps<HTMLDivElement>>;

const LoadingSpinner = ({ className, ...props }: Props) => {
  return (
    <div
      {...props}
      className={classNames("loading-spinner", className)}
      data-testid={TestId.LOADING}
    >
      <Spinner />
    </div>
  );
};

export default LoadingSpinner;
