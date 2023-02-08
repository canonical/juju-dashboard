import { Button } from "@canonical/react-components";
import runActionImage from "static/images/run-action-icon.svg";

type Props = { runActionDisabled: boolean; onRunActionsRun: () => void };
export default function SearchResultsActionsRow({
  runActionDisabled,
  onRunActionsRun,
}: Props) {
  return (
    <div className="applications-search-results__actions-row">
      <Button
        appearance="base"
        className="entity-details__action-button"
        hasIcon={true}
        onClick={onRunActionsRun}
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
