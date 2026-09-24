import { Icon, Tooltip } from "@canonical/react-components";
import type { FC } from "react";

import { pluralize } from "store/juju/utils/models";

import { resourceIconMap, type Props } from "./types";

const TOOLTIP_TRUNCATE_LIMIT = 9;

const ResourceCount: FC<Props> = ({ resourceType, resources }) => {
  const tooltipMessage =
    resources.length > TOOLTIP_TRUNCATE_LIMIT
      ? [
          ...resources.slice(0, TOOLTIP_TRUNCATE_LIMIT),
          `${resources.length - TOOLTIP_TRUNCATE_LIMIT} more ${pluralize(resources.length - TOOLTIP_TRUNCATE_LIMIT, resourceType).toLowerCase()}...`,
        ].join("\n")
      : resources.join("\n");

  return (
    <div className="u-flex u-flex-items-center u-flex--gap-x-small">
      <Icon
        name={resourceIconMap[resourceType]}
        className="u-no-margin--right"
      />
      {resources.length} {pluralize(resources.length, resourceType)}
      <Tooltip message={tooltipMessage} position="right">
        <Icon name="information" />
      </Tooltip>
    </div>
  );
};

export default ResourceCount;
