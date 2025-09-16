import type { FC } from "react";

import CharmIcon from "components/CharmIcon/CharmIcon";
import TruncatedTooltip from "components/TruncatedTooltip";

type Props = {
  charmId?: null | string;
  name: string;
  subordinate?: boolean;
};

const EntityIdentifier: FC<Props> = ({
  charmId = null,
  name,
  subordinate = false,
}: Props) => {
  return (
    <TruncatedTooltip message={name} wrapperClassName="entity-name">
      {subordinate && <span className="subordinate"></span>}
      {charmId && <CharmIcon name={name} charmId={charmId} />}
      {name}
    </TruncatedTooltip>
  );
};

export default EntityIdentifier;
