import { MainTable } from "@canonical/react-components";
import { useMemo } from "react";
import { useSelector } from "react-redux";
import { useParams } from "react-router-dom";

import type { Chip } from "components/ChipGroup/ChipGroup";
import ChipGroup from "components/ChipGroup/ChipGroup";
import ContentReveal from "components/ContentReveal/ContentReveal";
import type { EntityDetailsRoute } from "components/Routes/Routes";
import useModelStatus from "hooks/useModelStatus";
import { useQueryParams } from "hooks/useQueryParams";
import {
  getModelApplications,
  getModelUUIDFromList,
} from "store/juju/selectors";
import { pluralize } from "store/juju/utils/models";
import {
  appsOffersTableHeaders,
  remoteApplicationTableHeaders,
} from "tables/tableHeaders";
import {
  generateAppOffersRows,
  generateRemoteApplicationRows,
} from "tables/tableRows";

import { renderCounts } from "../../counts";

import LocalAppsTable from "./LocalAppsTable";
import SearchResults from "./SearchResults/SearchResults";

const ContentRevealTitle = ({
  count,
  subject,
  chips,
}: {
  count: number;
  subject: "Offer" | "Local application" | "Remote application";
  chips: Chip | null;
}) => (
  <>
    <span>
      {count} {pluralize(count, subject)}
    </span>
    <ChipGroup chips={chips} className="u-no-margin" descriptor={null} />
  </>
);

export default function ApplicationsTab() {
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
  const { userName, modelName } = useParams<EntityDetailsRoute>();
  const modelStatusData = useModelStatus();
  const modelUUID = useSelector(getModelUUIDFromList(modelName, userName));
  const applications = useSelector(getModelApplications(modelUUID));
  const localAppTableLength = applications
    ? Object.keys(applications).length
    : 0;

  const remoteApplicationTableRows = useMemo(() => {
    return modelName && userName
      ? generateRemoteApplicationRows(
          modelStatusData,
          { modelName, userName },
          queryParams
        )
      : [];
  }, [modelStatusData, modelName, userName, queryParams]);

  const appOffersRows = useMemo(
    () => generateAppOffersRows(modelStatusData, queryParams),
    [modelStatusData, queryParams]
  );
  const LocalAppChips = renderCounts("localApps", modelStatusData);
  const appOffersChips = renderCounts("offers", modelStatusData);
  const remoteAppChips = renderCounts("remoteApps", modelStatusData);

  const appOffersTableLength = appOffersRows?.length;

  const remoteAppsTableLength = remoteApplicationTableRows?.length;

  const countVisibleTables = (tablesLengths: number[]) =>
    tablesLengths.filter((rowLength) => rowLength > 0).length;

  const visibleTables = countVisibleTables([
    localAppTableLength,
    remoteAppsTableLength,
    appOffersTableLength,
  ]);

  const AppOffersTable = () => (
    <>
      {!!appOffersTableLength && (
        <>
          <MainTable
            headers={appsOffersTableHeaders}
            rows={appOffersRows}
            className="entity-details__offers p-main-table"
            sortable
            emptyStateMsg={"There are no offers associated with this model"}
          />
        </>
      )}
    </>
  );

  const RemoteAppsTable = () => (
    <>
      {!!remoteAppsTableLength && (
        <MainTable
          headers={remoteApplicationTableHeaders}
          rows={remoteApplicationTableRows}
          className="entity-details__remote-apps p-main-table"
          sortable
          emptyStateMsg={"There are no remote applications in this model"}
        />
      )}
    </>
  );
  const getContentReveals = () => {
    return (
      <>
        {!!localAppTableLength && (
          <ContentReveal
            title={
              <ContentRevealTitle
                count={localAppTableLength}
                subject="Local application"
                chips={LocalAppChips}
              />
            }
            openByDefault={true}
          >
            <LocalAppsTable applications={applications} />
          </ContentReveal>
        )}
        {!!appOffersTableLength && (
          <ContentReveal
            title={
              <ContentRevealTitle
                count={appOffersTableLength}
                subject="Offer"
                chips={appOffersChips}
              />
            }
            openByDefault={true}
          >
            {<AppOffersTable />}
          </ContentReveal>
        )}
        {!!remoteAppsTableLength && (
          <ContentReveal
            title={
              <ContentRevealTitle
                count={remoteAppsTableLength}
                subject="Remote application"
                chips={remoteAppChips}
              />
            }
            openByDefault={true}
          >
            {<RemoteAppsTable />}
          </ContentReveal>
        )}
      </>
    );
  };
  if (queryParams.filterQuery) {
    return <SearchResults />;
  } else if (visibleTables === 0) {
    return (
      <span>
        There are no applications associated with this model. Learn about{" "}
        <a
          className="p-link--external"
          href="https://juju.is/docs/deploying-applications"
        >
          deploying applications
        </a>
      </span>
    );
  } else if (visibleTables > 1) {
    return getContentReveals();
  } else {
    return (
      <>
        <LocalAppsTable applications={applications} />
        <AppOffersTable />
        <RemoteAppsTable />
      </>
    );
  }
}
