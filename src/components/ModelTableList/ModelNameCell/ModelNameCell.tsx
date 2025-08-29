import { Spinner } from "@canonical/react-components";

import ModelDetailsLink from "components/ModelDetailsLink";
import TruncatedTooltip from "components/TruncatedTooltip";
import type { ModelData } from "store/juju/types";

import WarningMessage from "../StatusGroup/WarningMessage";
import { GroupBy } from "../types";

type Props = {
  loading: boolean;
  model: ModelData;
  groupBy: string;
  groupLabel?: string;
};

export default function ModelNameCell({
  loading,
  model,
  groupBy,
  groupLabel,
}: Props) {
  return (
    <>
      <TruncatedTooltip message={model.model.name}>
        {loading ? <Spinner /> : null}
        <ModelDetailsLink
          modelName={model.model.name}
          ownerTag={model.info?.["owner-tag"]}
        >
          {model.model.name}
        </ModelDetailsLink>
      </TruncatedTooltip>
      {groupBy === GroupBy.STATUS && groupLabel === "Blocked" ? (
        <WarningMessage model={model} />
      ) : null}
    </>
  );
}
