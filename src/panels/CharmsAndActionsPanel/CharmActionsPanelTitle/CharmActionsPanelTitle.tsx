import type { JSX } from "react";

import CharmIcon from "components/CharmIcon";
import {
  getSelectedApplications,
  getSelectedCharm,
} from "store/juju/selectors";
import { pluralize } from "store/juju/utils/models";
import { useAppSelector } from "store/store";

import { Label } from "./types";

type Props = {
  charmURL: string;
};

const CharmActionsPanelTitle = ({ charmURL }: Props): JSX.Element => {
  const selectedApplications = useAppSelector((state) =>
    getSelectedApplications(state, charmURL),
  );
  const selectedCharm = useAppSelector((state) =>
    getSelectedCharm(state, charmURL),
  );
  const selectedCount = Object.keys(selectedApplications).length;

  if (!selectedCount || !selectedCharm) {
    return <>{Label.NONE_SELECTED_TITLE}</>;
  }
  const totalUnits = Object.values(selectedApplications).reduce(
    (total, app) => total + (Object.keys(app.units).length ?? 0),
    0,
  );

  return (
    <>
      {selectedCharm?.meta?.name && selectedCharm?.url ? (
        <CharmIcon name={selectedCharm.meta.name} charmId={selectedCharm.url} />
      ) : null}{" "}
      {selectedCount} {pluralize(selectedCount, "application")} ({totalUnits}{" "}
      {pluralize(totalUnits, "unit")}) selected
    </>
  );
};

export default CharmActionsPanelTitle;
