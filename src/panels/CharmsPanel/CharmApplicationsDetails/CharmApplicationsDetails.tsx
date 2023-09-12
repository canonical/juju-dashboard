import { useSelector } from "react-redux";

import { getSelectedApplications } from "store/juju/selectors";

type Props = {
  charmURL: string;
};

const CharmApplicationsDetails = ({ charmURL }: Props): JSX.Element => {
  const selectedApplications = useSelector(getSelectedApplications(charmURL));

  return (
    <p className="p-form-help-text is-tick-element">
      Apps:{" "}
      {selectedApplications
        .map((application) => ("name" in application ? application.name : null))
        .filter((application) => !!application)
        .join(", ")}
      .
    </p>
  );
};

export default CharmApplicationsDetails;
