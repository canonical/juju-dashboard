import { Spinner } from "@canonical/react-components";
import classNames from "classnames";
import type { FC, HTMLProps } from "react";

import { TestId } from "./types";

type Props = HTMLProps<HTMLDivElement>;

const LoadingSpinner: FC<Props> = ({ className, ...props }: Props) => {
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
