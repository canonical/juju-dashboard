import CharmIcon from "components/CharmIcon/CharmIcon";
import TruncatedTooltip from "components/TruncatedTooltip";

type Props = {
  charmId?: string | null;
  name: string;
  subordinate?: boolean;
};

const EntityIdentifier = ({ charmId, name, subordinate = false }: Props) => {
  return (
    <TruncatedTooltip message={name} wrapperClassName="entity-name">
      {subordinate && <span className="subordinate"></span>}
      {charmId && <CharmIcon name={name} charmId={charmId} />}
      {name}
    </TruncatedTooltip>
  );
};

export default EntityIdentifier;
