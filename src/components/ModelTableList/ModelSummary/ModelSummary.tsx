import { Icon, Tooltip } from "@canonical/react-components";

import ModelDetailsLink from "components/ModelDetailsLink";
import type { ModelData } from "store/juju/types";
import { ModelTab } from "urls";

export enum Label {
  APPS = "Number of applications",
  MACHINES = "Number of machines",
  UNITS = "Number of units",
}

type Props = {
  modelData: ModelData;
  ownerTag?: string;
};

const ModelSummary = ({ modelData, ownerTag }: Props) => {
  const applicationKeys = Object.keys(modelData.applications);
  const applicationCount = applicationKeys.length;
  const machineCount = Object.keys(modelData.machines).length;
  const unitCount = applicationKeys.reduce((prev, key) => {
    const units = modelData.applications[key].units || {};
    return prev + Object.keys(units).length;
  }, 0);
  return (
    <div className="u-flex">
      <Tooltip
        message="See applications"
        position="top-center"
        className="u-flex--block has-icon"
      >
        <ModelDetailsLink
          modelName={modelData.model.name}
          ownerTag={ownerTag}
          view={ModelTab.APPS}
          className="p-link--soft"
          aria-label={Label.APPS}
        >
          <Icon name="applications" />
          <span>{applicationCount}</span>
        </ModelDetailsLink>
      </Tooltip>
      <Tooltip
        message="Units"
        position="top-center"
        className="u-flex--block has-icon"
      >
        <Icon name="units" />
        <span aria-label={Label.UNITS}>{unitCount}</span>
      </Tooltip>
      <Tooltip
        message="See machines"
        position="top-center"
        className="u-flex--block has-icon"
      >
        <ModelDetailsLink
          modelName={modelData.model.name}
          ownerTag={ownerTag}
          view={ModelTab.MACHINES}
          className="p-link--soft"
          aria-label={Label.MACHINES}
        >
          <Icon name="machines" />
          <span>{machineCount}</span>
        </ModelDetailsLink>
      </Tooltip>
    </div>
  );
};

export default ModelSummary;
