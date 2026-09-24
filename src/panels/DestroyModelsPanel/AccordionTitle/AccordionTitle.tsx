import { Icon } from "@canonical/react-components";
import { Tooltip } from "@canonical/react-components";
import classNames from "classnames";
import type { JSX } from "react";

import useModelDestructionData from "hooks/useModelDestructionData";
import { getSelectedModelForDestruction } from "store/juju/selectors";
import { DestroyBlockedReason } from "store/juju/types";
import { useAppSelector } from "store/store";

import { Label } from "../types";

type Props = {
  modelName: string;
  modelUUID: string;
};

const AccordionTitle = ({ modelName, modelUUID }: Props): JSX.Element => {
  const destructionData = useModelDestructionData([modelUUID]);
  const {
    applications: applicationKeys,
    machines,
    destroyBlockedReason,
    unitCount,
  } = destructionData[modelUUID];
  const selectedModel = useAppSelector((state) =>
    getSelectedModelForDestruction(state, modelUUID),
  );
  const isReviewed = selectedModel?.reviewed;
  const isSkipped = selectedModel?.skipped;
  const isDestroyBlocked = destroyBlockedReason !== null;
  let destroyTooltip: null | string = null;
  if (isDestroyBlocked) {
    if (destroyBlockedReason === DestroyBlockedReason.IS_CONTROLLER) {
      destroyTooltip = Label.TOOLTIP_CONTROLLER_MODEL;
    } else if (destroyBlockedReason === DestroyBlockedReason.NO_ACCESS) {
      destroyTooltip = Label.TOOLTIP_NO_ACCESS;
    } else if (destroyBlockedReason === DestroyBlockedReason.CONNECTED_OFFERS) {
      destroyTooltip = Label.TOOLTIP_CONNECTED_OFFERS;
    }
  }

  return (
    <span
      className={classNames("accordion-title", {
        "accordion-title--is-skipped": isDestroyBlocked || isSkipped,
      })}
    >
      <span>
        {isReviewed && !isSkipped ? (
          <Icon name="success" className="u-sh1--right" />
        ) : null}
        {modelName}
        {isDestroyBlocked ? (
          <Tooltip message={destroyTooltip} position="right">
            <Icon name="help" className="u-sh1" />
          </Tooltip>
        ) : null}
      </span>
      <div className="accordion-title__model-summary">
        <div className="accordion-title__model-summary-item">
          <Icon name="applications" className="u-no-margin--top" />
          {applicationKeys.length}
        </div>
        <div className="accordion-title__model-summary-item">
          <Icon name="units" className="u-no-margin--top" />
          {unitCount}
        </div>
        <div className="accordion-title__model-summary-item">
          <Icon name="machines" className="u-no-margin--top" />
          {machines.length}
        </div>
      </div>
    </span>
  );
};

export default AccordionTitle;
