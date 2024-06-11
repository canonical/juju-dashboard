import type { Chip } from "components/ChipGroup";
import ChipGroup from "components/ChipGroup";
import { pluralize } from "store/juju/utils/models";

type Props = {
  count: number;
  subject: "Offer" | "Local application" | "Remote application";
  chips: Chip | null;
};

const ContentRevealTitle = ({ count, subject, chips }: Props) => (
  <>
    <span>
      {count} {pluralize(count, subject)}
    </span>
    <ChipGroup chips={chips} className="u-no-margin" descriptor={null} />
  </>
);

export default ContentRevealTitle;
