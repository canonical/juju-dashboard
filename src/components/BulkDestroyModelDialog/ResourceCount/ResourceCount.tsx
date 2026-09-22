import { Icon, Tooltip } from "@canonical/react-components";
import type { FC } from "react";

import { pluralize } from "store/juju/utils/models";

import { resourceIconMap, type Props } from "./types";

const ResourceCount: FC<Props> = ({ resourceType, resources }) => (
  <div className="u-flex u-flex-items-center u-flex--gap-x-small">
    <Icon name={resourceIconMap[resourceType]} className="u-no-margin--right" />
    {resources.length} {pluralize(resources.length, resourceType)}
    <Tooltip message={resources.join("\n")} position="right">
      <Icon name="information" />
    </Tooltip>
  </div>
);

export default ResourceCount;
