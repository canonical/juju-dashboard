import { Button, Icon } from "@canonical/react-components";
import type { MouseEvent } from "react";
import { useSelector } from "react-redux";

import useAnalytics from "hooks/useAnalytics";
import { useQueryParams } from "hooks/useQueryParams";
import { getSelectedApplications } from "store/juju/selectors";

import AppSearchBox from "../AppSearchBox";

const SearchResultsActionsRow = () => {
  const selectedApplications = useSelector(getSelectedApplications());
  const sendAnalytics = useAnalytics();
  const [queryParams, setQueryParams] = useQueryParams<{
    panel: string | null;
    filterQuery: string | null;
  }>({
    panel: null,
    filterQuery: null,
  });

  const handleRunAction = async (event: MouseEvent) => {
    event.stopPropagation();
    sendAnalytics({
      category: "ApplicationSearch",
      action: "Run action (button)",
    });
    setQueryParams({ panel: "select-charms-and-actions" }, { replace: true });
  };

  return (
    <div className="applications-search-results__actions-row u-flex">
      {queryParams.filterQuery && (
        <Button
          appearance="base"
          className="entity-details__action-button"
          hasIcon={true}
          onClick={handleRunAction}
          disabled={!selectedApplications.length}
        >
          <Icon name="run-action" />
          <span>Run action</span>
        </Button>
      )}
      <AppSearchBox />
    </div>
  );
};

export default SearchResultsActionsRow;
