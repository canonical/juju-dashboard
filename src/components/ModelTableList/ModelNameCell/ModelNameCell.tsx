import ModelDetailsLink from "components/ModelDetailsLink";
import TruncatedTooltip from "components/TruncatedTooltip";
import type { ModelData } from "store/juju/types";

type Props = {
  model: ModelData;
};

const ModelNameCell = ({ model }: Props) => {
  return (
    <TruncatedTooltip message={model.model.name}>
      <ModelDetailsLink
        modelName={model.model.name}
        ownerTag={model.info?.["owner-tag"]}
      >
        {model.model.name}
      </ModelDetailsLink>
    </TruncatedTooltip>
  );
};

export default ModelNameCell;
