import { Icon } from "@canonical/react-components";
import { Tooltip } from "@canonical/react-components";
import classNames from "classnames";
import type { JSX } from "react";

import useModelDestructionData from "hooks/useModelDestructionData";
import { getSelectedModelForDestruction } from "store/juju/selectors";
import { useAppSelector } from "store/store";

type Props = {
  modelName: string;
  modelUUID: string;
};

const AccordionTitle = ({ modelName, modelUUID }: Props): JSX.Element => {
  const {
    applications: applicationKeys,
    machines,
    destroyBlockedReason,
    unitCount,
  } = useModelDestructionData(modelUUID);
  const selectedModel = useAppSelector((state) =>
    getSelectedModelForDestruction(state, modelUUID),
  );
  const isReviewed = selectedModel?.reviewed;
  const isRemoved = selectedModel?.removed;
  const isDestroyBlocked = destroyBlockedReason !== null;

  return (
    <span
      className={classNames("accordion-title", {
        "accordion-title--is-removed": isDestroyBlocked || isRemoved,
      })}
    >
      <span>
        {isReviewed ? <Icon name="success" className="u-sh1--right" /> : null}
        {modelName}
        {isDestroyBlocked ? (
          <Tooltip
            message="Controller model cannot be deleted"
            position="right"
          >
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
