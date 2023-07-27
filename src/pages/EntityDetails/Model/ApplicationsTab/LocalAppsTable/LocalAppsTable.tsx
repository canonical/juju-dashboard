import { MainTable } from "@canonical/react-components";
import type { MainTableRow } from "@canonical/react-components/dist/components/MainTable/MainTable";
import classnames from "classnames";
import { useMemo } from "react";
import { useSelector } from "react-redux";
import { useParams } from "react-router-dom";

import type { EntityDetailsRoute } from "components/Routes/Routes";
import { useQueryParams } from "hooks/useQueryParams";
import type { ApplicationData } from "juju/types";
import {
  getAllModelApplicationStatus,
  getModelUUIDFromList,
} from "store/juju/selectors";
import { generateLocalApplicationTableHeaders } from "tables/tableHeaders";
import { generateLocalApplicationRows } from "tables/tableRows";

import SearchResultsActionsRow from "./SearchResultsActionsRow";
import {
  addSelectAllColumn,
  addSelectColumn,
  useTableSelect,
} from "./useTableSelect";

export enum Label {
  NONE = "There are no local applications in this model",
  NONE_SEARCH = "No matching local applications found in this model",
}

type Props = {
  applications?: ApplicationData | null;
};

const LocalAppsTable = ({ applications }: Props) => {
  const { userName, modelName } = useParams<EntityDetailsRoute>();
  const modelUUID = useSelector(getModelUUIDFromList(modelName, userName));
  const applicationStatuses = useSelector(
    getAllModelApplicationStatus(modelUUID)
  );
  const [queryParams] = useQueryParams<{
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

  if (queryParams.filterQuery && applications) {
    headers = addSelectAllColumn(headers, selectAll, handleSelectAll);
    rows = addSelectColumn(rows, applications, handleSelect);
  }

  return (
    <>
      <SearchResultsActionsRow />
      <MainTable
        headers={headers}
        rows={rows}
        className={classnames("entity-details__apps p-main-table", {
          selectable: queryParams.filterQuery,
        })}
        sortable
        emptyStateMsg={queryParams.filterQuery ? Label.NONE_SEARCH : Label.NONE}
      />
    </>
  );
};

export default LocalAppsTable;
