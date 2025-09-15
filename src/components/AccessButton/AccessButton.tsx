import { Button, Icon } from "@canonical/react-components";
import type { FC } from "react";
import { Link } from "react-router";

import { useQueryParams } from "hooks/useQueryParams";
import { getIsJuju } from "store/general/selectors";
import { useAppSelector } from "store/store";
import { rebacURLS } from "urls";

import type { Props } from "./types";

const AccessButton: FC<Props> = ({
  children,
  displayIcon,
  modelName,
  ...props
}: Props) => {
  const isJuju = useAppSelector(getIsJuju);
  const [_panelQs, setPanelQs] = useQueryParams<{
    model: null | string;
    panel: null | string;
  }>({
    model: null,
    panel: null,
  });
  return (
    <Button
      {...props}
      {...(isJuju
        ? {
            onClick: (event): void => {
              event.stopPropagation();
              setPanelQs(
                {
                  model: modelName,
                  panel: "share-model",
                },
                { replace: true },
              );
            },
          }
        : {
            element: Link,
            to: rebacURLS.groups.index,
          })}
      hasIcon={displayIcon}
    >
      {displayIcon ? <Icon name="share" /> : null}
      <span>{children}</span>
    </Button>
  );
};

export default AccessButton;
