import type { JSX } from "react";
import { useParams } from "react-router";

import CharmIcon from "components/CharmIcon";
import {
  getModelApplications,
  getModelUUIDFromList,
  getSelectedApplications,
  getSelectedCharm,
} from "store/juju/selectors";
import { pluralize } from "store/juju/utils/models";
import { getScale } from "store/juju/utils/units";
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
  const { qualifier, modelName } = useParams();
  const modelUUID = useAppSelector((state) =>
    getModelUUIDFromList(state, modelName, qualifier),
  );
  const applications = useAppSelector((state) =>
    getModelApplications(state, modelUUID),
  );
  const selectedCount = Object.keys(selectedApplications).length;

  if (!selectedCount || !selectedCharm) {
    return <>{Label.NONE_SELECTED_TITLE}</>;
  }
  const totalUnits = applications
    ? getScale(Object.keys(selectedApplications), applications)
    : 0;

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
