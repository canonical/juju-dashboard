import { ContextualMenu } from "@canonical/react-components";
import { Link } from "react-router";

import useCanConfigureModel from "hooks/useCanConfigureModel";
import { useQueryParams } from "hooks/useQueryParams";
import { getIsJuju } from "store/general/selectors";
import { useAppSelector } from "store/store";
import { rebacURLS } from "urls";

import { Label, type Props } from "./types";

const ModelActions = ({ modelName, activeUser }: Props) => {
  const [, setPanelQs] = useQueryParams<{
    model: string | null;
    panel: string | null;
  }>({
    model: null,
    panel: null,
  });
  const canConfigureModel = useCanConfigureModel(false, modelName, activeUser);
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
                onClick: (event) => {
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
