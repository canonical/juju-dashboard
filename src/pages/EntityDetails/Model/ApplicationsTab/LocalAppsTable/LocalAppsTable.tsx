import { MainTable, Button, Icon } from "@canonical/react-components";
import type { MainTableRow } from "@canonical/react-components/dist/components/MainTable/MainTable";
import classnames from "classnames";
import type { MouseEvent } from "react";
import { useMemo } from "react";
import { useSelector } from "react-redux";
import { useParams } from "react-router-dom";

import type { EntityDetailsRoute } from "components/Routes/Routes";
import useAnalytics from "hooks/useAnalytics";
import useCanConfigureModel from "hooks/useCanConfigureModel";
import { useQueryParams } from "hooks/useQueryParams";
import type { ApplicationData } from "juju/types";
import {
  getAllModelApplicationStatus,
  getModelUUIDFromList,
  getSelectedApplications,
} from "store/juju/selectors";
import { generateLocalApplicationTableHeaders } from "tables/tableHeaders";
import { generateLocalApplicationRows } from "tables/tableRows";

import AppSearchBox from "./AppSearchBox";
import {
  addSelectAllColumn,
  addSelectColumn,
  useTableSelect,
} from "./useTableSelect";

export enum Label {
  NONE = "There are no local applications in this model",
  NONE_SEARCH = "No matching local applications found in this model",
  RUN_ACTION = "Run action",
}

type Props = {
  applications?: ApplicationData | null;
};

const LocalAppsTable = ({ applications }: Props) => {
  const sendAnalytics = useAnalytics();
  const { userName, modelName } = useParams<EntityDetailsRoute>();
  const modelUUID = useSelector(getModelUUIDFromList(modelName, userName));
  const applicationStatuses = useSelector(
    getAllModelApplicationStatus(modelUUID)
  );
  const selectedApplications = useSelector(getSelectedApplications());
  const canConfigureModel = useCanConfigureModel();
  const [queryParams, setQueryParams] = useQueryParams<{
    entity: string | null;
    panel: string | null;
    activeView: string;
    filterQuery: string | null;
  }>({
    panel: null,
    entity: null,
    activeView: "apps",
    filterQuery: null,
  });
  const { handleSelect, handleSelectAll, selectAll } = useTableSelect(
    applications ? Object.values(applications) : []
  );
  const selectable =
    queryParams.filterQuery && applications && canConfigureModel;

  let headers = generateLocalApplicationTableHeaders();
  let rows: MainTableRow[] = useMemo(() => {
    return modelName && userName && applications
      ? generateLocalApplicationRows(
          applications,
          applicationStatuses,
          { modelName, userName },
          queryParams
        )
      : [];
  }, [applications, applicationStatuses, modelName, userName, queryParams]);

  if (selectable) {
    headers = addSelectAllColumn(headers, selectAll, handleSelectAll);
    rows = addSelectColumn(rows, applications, handleSelect);
  }
  const handleRunAction = async (event: MouseEvent) => {
    event.stopPropagation();
    sendAnalytics({
      category: "ApplicationSearch",
      action: "Run action (button)",
    });
    setQueryParams({ panel: "select-charms-and-actions" }, { replace: true });
  };

  return (
    <>
      <div className="applications-search-results__actions-row u-flex">
        {selectable && (
          <Button
            appearance="base"
            className="entity-details__action-button"
            hasIcon={true}
            onClick={handleRunAction}
            disabled={!selectedApplications.length}
          >
            <Icon name="run-action" />
            <span>{Label.RUN_ACTION}</span>
          </Button>
        )}
        <AppSearchBox />
      </div>
      <MainTable
        headers={headers}
        rows={rows}
        className={classnames("entity-details__apps p-main-table", {
          selectable,
        })}
        sortable
        emptyStateMsg={queryParams.filterQuery ? Label.NONE_SEARCH : Label.NONE}
      />
    </>
  );
};

export default LocalAppsTable;
