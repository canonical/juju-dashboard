import {
  Chip,
  type ChipProps,
  type PropsWithSpread,
} from "@canonical/react-components";
import type { FC } from "react";

import {
  getModelUUIDFromList,
  getModelDataByUUID,
  getControllerByUUID,
} from "store/juju/selectors";
import { useAppSelector } from "store/store";
import isHigherSemver from "utils/isHigherSemver";

export type Props = PropsWithSpread<
  {
    modelName?: null | string;
    qualifier?: null | string;
    // A version that will be displayed instead of the model's current version.
    versionOverride?: null | string;
  },
  Partial<ChipProps>
>;

const ModelVersion: FC<Props> = ({
  modelName,
  qualifier,
  versionOverride,
  ...props
}: Props) => {
  const modelUUID = useAppSelector((state) =>
    getModelUUIDFromList(state, modelName, qualifier),
  );
  const model = useAppSelector((state) => getModelDataByUUID(state, modelUUID));
  const controller = useAppSelector((state) =>
    getControllerByUUID(state, model?.info?.["controller-uuid"]),
  );
  const currentVersion = versionOverride ?? model?.model.version;
  const higherControllerVersion =
    currentVersion &&
    controller &&
    "agent-version" in controller &&
    isHigherSemver(controller["agent-version"], currentVersion);
  return currentVersion ? (
    <Chip
      {...props}
      isReadOnly
      isInline
      isDense
      appearance={higherControllerVersion ? "caution" : undefined}
      value={currentVersion}
    />
  ) : null;
};

export default ModelVersion;
