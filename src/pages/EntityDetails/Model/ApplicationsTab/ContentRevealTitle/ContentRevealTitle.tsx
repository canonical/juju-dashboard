import type { FC } from "react";

import type { Chip } from "components/ChipGroup";
import ChipGroup from "components/ChipGroup";
import { pluralize } from "store/juju/utils/models";

type Props = {
  count: number;
  subject: "Local application" | "Offer" | "Remote application";
  chips: Chip | null;
};

const ContentRevealTitle: FC<Props> = ({ count, subject, chips }: Props) => (
  <>
    <span>
      {count} {pluralize(count, subject)}
    </span>
    <ChipGroup chips={chips} className="u-no-margin" descriptor={null} />
  </>
);

export default ContentRevealTitle;
