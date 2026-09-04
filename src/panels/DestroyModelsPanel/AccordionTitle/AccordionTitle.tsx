import { Icon } from "@canonical/react-components";
import { Tooltip } from "@canonical/react-components";
import classNames from "classnames";
import type { JSX } from "react";

import useModelDestructionData from "hooks/useModelDestructionData";

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
  const isDestroyBlocked = destroyBlockedReason !== null;

  return (
    <span
      className={classNames("accordion-title", {
        "accordion-title--is-removed": isDestroyBlocked,
      })}
    >
      <span>
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
