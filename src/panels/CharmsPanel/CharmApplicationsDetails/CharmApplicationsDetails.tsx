import { getSelectedApplications } from "store/juju/selectors";
import { useAppSelector } from "store/store";

type Props = {
  charmURL: string;
};

const CharmApplicationsDetails = ({ charmURL }: Props): JSX.Element => {
  const selectedApplications = useAppSelector(
    getSelectedApplications(charmURL)
  );

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
