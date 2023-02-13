import { Button } from "@canonical/react-components";
import useAnalytics from "hooks/useAnalytics";
import runActionImage from "static/images/run-action-icon.svg";

type Props = { runActionDisabled: boolean; onRunActionsRun: () => void };
export default function SearchResultsActionsRow({
  runActionDisabled,
  onRunActionsRun,
}: Props) {
  const sendAnalytics = useAnalytics();

  const handleRunAction = () => {
    sendAnalytics({
      category: "ApplicationSearch",
      action: "Run action (button)",
    });
    onRunActionsRun();
  };

  return (
    <div className="applications-search-results__actions-row">
      <Button
        appearance="base"
        className="entity-details__action-button"
        hasIcon={true}
        onClick={handleRunAction}
        disabled={runActionDisabled}
      >
        <img
          className="entity-details__action-button-row-icon"
          src={runActionImage}
          alt=""
        />
        Run action
      </Button>
    </div>
  );
}
