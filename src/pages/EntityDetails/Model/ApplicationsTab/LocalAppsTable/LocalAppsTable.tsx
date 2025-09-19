import { MainTable, Button, Icon } from "@canonical/react-components";
import type {
  MainTableCell,
  MainTableRow,
} from "@canonical/react-components/dist/components/MainTable/MainTable";
import classnames from "classnames";
import type { FC } from "react";
import { useMemo } from "react";
import { useParams } from "react-router";

import type { EntityDetailsRoute } from "components/Routes";
import useAnalytics from "hooks/useAnalytics";
import useCanConfigureModel from "hooks/useCanConfigureModel";
import { useQueryParams } from "hooks/useQueryParams";
import type { ApplicationData } from "juju/types";
import {
  getAllModelApplicationStatus,
  getModelUUIDFromList,
  getSelectedApplications,
} from "store/juju/selectors";
import { useAppSelector } from "store/store";
import type { Header } from "tables/tableHeaders";
import { generateLocalApplicationTableHeaders } from "tables/tableHeaders";
import { generateLocalApplicationRows } from "tables/tableRows";

import AppSearchBox from "./AppSearchBox";
import { Label } from "./types";
import {
  addSelectAllColumn,
  addSelectColumn,
  useTableSelect,
} from "./useTableSelect";

type Props = {
  applications?: ApplicationData | null;
};

const LocalAppsTable: FC<Props> = ({ applications }: Props) => {
  const sendAnalytics = useAnalytics();
  const { userName, modelName } = useParams<EntityDetailsRoute>();
  const modelUUID = useAppSelector((state) =>
    getModelUUIDFromList(state, modelName, userName),
  );
  const applicationStatuses = useAppSelector((state) =>
    getAllModelApplicationStatus(state, modelUUID),
  );
  const selectedApplications = useAppSelector(getSelectedApplications);
  const canConfigureModel = useCanConfigureModel();
  const [queryParams, setQueryParams] = useQueryParams<{
    entity: null | string;
    panel: null | string;
    activeView: string;
    filterQuery: null | string;
  }>({
    panel: null,
    entity: null,
    activeView: "apps",
    filterQuery: null,
  });
  const { handleSelect, handleSelectAll, selectAll } = useTableSelect(
    applications ? Object.values(applications) : [],
  );
  const selectable =
    queryParams.filterQuery && applications && canConfigureModel;

  let headers: Header | MainTableCell[] =
    generateLocalApplicationTableHeaders();
  let rows: MainTableRow[] = useMemo(() => {
    return modelName && userName && applications
      ? generateLocalApplicationRows(
          applications,
          applicationStatuses,
          { modelName, userName },
          queryParams,
        )
      : [];
  }, [applications, applicationStatuses, modelName, userName, queryParams]);

  if (selectable) {
    headers = addSelectAllColumn(headers, selectAll, handleSelectAll);
    rows = addSelectColumn(rows, applications, handleSelect);
  }
  const handleRunAction = (event: React.MouseEvent): void => {
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
