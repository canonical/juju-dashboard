import { MainTable } from "@canonical/react-components";
import { useMemo } from "react";

import useModelStatus from "hooks/useModelStatus";
import { appsOffersTableHeaders } from "tables/tableHeaders";
import { generateAppOffersRows } from "tables/tableRows";

import { Label } from "./types";

const AppOffersTable = () => {
  const modelStatusData = useModelStatus();
  const appOffersRows = useMemo(
    () => generateAppOffersRows(modelStatusData),
    [modelStatusData],
  );

  return (
    <MainTable
      headers={appsOffersTableHeaders}
      rows={appOffersRows}
      className="entity-details__offers p-main-table"
      sortable
      emptyStateMsg={Label.NO_OFFERS}
    />
  );
};

export default AppOffersTable;
