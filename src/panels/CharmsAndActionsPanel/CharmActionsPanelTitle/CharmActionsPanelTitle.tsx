import { useSelector } from "react-redux";

import CharmIcon from "components/CharmIcon";
import {
  getSelectedApplications,
  getSelectedCharm,
} from "store/juju/selectors";
import { pluralize } from "store/juju/utils/models";

type Props = {
  charmURL: string;
};

enum Label {
  NONE_SELECTED_TITLE = "You need to select a charm and applications to continue.",
}

const CharmActionsPanelTitle = ({ charmURL }: Props): JSX.Element => {
  const selectedApplications = useSelector(getSelectedApplications(charmURL));
  const selectedCharm = useSelector(getSelectedCharm(charmURL));

  if (!selectedApplications || !selectedCharm)
    return <>{Label.NONE_SELECTED_TITLE}</>;
  const totalUnits = selectedApplications.reduce(
    (total, app) => total + (app["unit-count"] || 0),
    0
  );

  return (
    <h5>
      {selectedCharm?.meta?.name && selectedCharm?.url ? (
        <CharmIcon name={selectedCharm.meta.name} charmId={selectedCharm.url} />
      ) : null}{" "}
      {selectedApplications.length}{" "}
      {pluralize(selectedApplications.length, "application")} ({totalUnits}{" "}
      {pluralize(totalUnits, "unit")}) selected
    </h5>
  );
};

export default CharmActionsPanelTitle;
