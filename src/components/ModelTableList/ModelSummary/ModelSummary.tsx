import { Icon, Tooltip } from "@canonical/react-components";
import type { FC } from "react";

import ModelDetailsLink from "components/ModelDetailsLink";
import type { ModelData } from "store/juju/types";
import { ModelTab } from "urls";

import { Label } from "./types";

type Props = {
  modelData: ModelData;
  qualifier?: string;
};

const ModelSummary: FC<Props> = ({ modelData, qualifier }: Props) => {
  const applicationKeys = Object.keys(modelData.applications);
  const applicationCount = applicationKeys.length;
  const machineCount = Object.keys(modelData.machines).length;
  const unitCount = applicationKeys.reduce((prev, key) => {
    const units = modelData.applications[key].units ?? {};
    return prev + Object.keys(units).length;
  }, 0);
  return (
    <div className="u-flex">
      <Tooltip
        message="See applications"
        position="top-center"
        className="u-flex--block u-has-icon"
      >
        <ModelDetailsLink
          modelName={modelData.model.name}
          qualifier={qualifier}
          view={ModelTab.APPS}
          className="p-link--soft"
          aria-label={Label.APPS}
        >
          <Icon name="applications" className="u-no-margin--top" />
          <span>{applicationCount}</span>
        </ModelDetailsLink>
      </Tooltip>
      <Tooltip
        message="Units"
        position="top-center"
        className="u-flex--block u-has-icon"
      >
        <Icon name="units" className="u-no-margin--top" />
        <span aria-label={Label.UNITS}>{unitCount}</span>
      </Tooltip>
      <Tooltip
        message="See machines"
        position="top-center"
        className="u-flex--block u-has-icon"
      >
        <ModelDetailsLink
          modelName={modelData.model.name}
          qualifier={qualifier}
          view={ModelTab.MACHINES}
          className="p-link--soft"
          aria-label={Label.MACHINES}
        >
          <Icon name="machines" className="u-no-margin--top" />
          <span>{machineCount}</span>
        </ModelDetailsLink>
      </Tooltip>
    </div>
  );
};

export default ModelSummary;
