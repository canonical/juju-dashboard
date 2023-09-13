import { Tooltip } from "@canonical/react-components";

import type { ApplicationInfo } from "juju/types";
import { getSelectedApplications } from "store/juju/selectors";
import { useAppSelector } from "store/store";

type Props = {
  charmURL: string;
};

const formatApplicationsDetails = (applications: ApplicationInfo[]) =>
  applications
    .map((application) => ("name" in application ? application.name : null))
    .filter((application) => !!application)
    .join(", ");

const CharmApplicationsDetails = ({ charmURL }: Props): JSX.Element => {
  const selectedApplications = useAppSelector(
    getSelectedApplications(charmURL)
  );
  const displayedApplications = selectedApplications.slice(0, 5);
  const hiddenApplications = selectedApplications.slice(5);

  return (
    <p className="p-form-help-text is-tick-element">
      <Tooltip
        message={
          hiddenApplications.length ? (
            <span>..., {formatApplicationsDetails(hiddenApplications)}</span>
          ) : null
        }
        position="btm-left"
      >
        {formatApplicationsDetails(displayedApplications)}
        {hiddenApplications.length ? (
          <span>, +{hiddenApplications.length} more...</span>
        ) : null}
      </Tooltip>
    </p>
  );
};

export default CharmApplicationsDetails;
