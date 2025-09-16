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

  if (!selectedApplications.length || !selectedCharm) {
    return <>{Label.NONE_SELECTED_TITLE}</>;
  }
  const totalUnits = selectedApplications.reduce(
    (total, app) => total + (app["unit-count"] ?? 0),
    0,
  );

  return (
    <>
      {selectedCharm?.meta?.name && selectedCharm?.url ? (
        <CharmIcon name={selectedCharm.meta.name} charmId={selectedCharm.url} />
      ) : null}{" "}
      {selectedApplications.length}{" "}
      {pluralize(selectedApplications.length, "application")} ({totalUnits}{" "}
      {pluralize(totalUnits, "unit")}) selected
    </>
  );
};

export default CharmActionsPanelTitle;
