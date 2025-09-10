import { ContextualMenu } from "@canonical/react-components";
import type { FC } from "react";
import { Link } from "react-router";

import { useCanConfigureModelWithUUID } from "hooks/useCanConfigureModel";
import { useQueryParams } from "hooks/useQueryParams";
import { getIsJuju } from "store/general/selectors";
import { useAppSelector } from "store/store";
import { rebacURLS } from "urls";

import { Label, type Props } from "./types";

const ModelActions: FC<Props> = ({ modelName, modelUUID }: Props) => {
  const [, setPanelQs] = useQueryParams<{
    model: null | string;
    panel: null | string;
  }>({
    model: null,
    panel: null,
  });
  const canConfigureModel = useCanConfigureModelWithUUID(false, modelUUID);
  const isJuju = useAppSelector(getIsJuju);

  return (
    <ContextualMenu
      hasToggleIcon
      toggleAppearance="base"
      toggleClassName="has-icon u-no-margin--bottom"
      links={[
        {
          children: Label.ACCESS,
          disabled: !canConfigureModel,
          ...(isJuju
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
              }),
        },
      ]}
    />
  );
};

export default ModelActions;
