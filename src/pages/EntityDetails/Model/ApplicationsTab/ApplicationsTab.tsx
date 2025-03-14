import { useParams } from "react-router";

import ContentReveal from "components/ContentReveal";
import type { EntityDetailsRoute } from "components/Routes";
import useModelStatus from "hooks/useModelStatus";
import { useQueryParams } from "hooks/useQueryParams";
import {
  getModelApplications,
  getModelUUIDFromList,
} from "store/juju/selectors";
import { useAppSelector } from "store/store";

import { renderCounts } from "../../counts";

import AppOffersTable from "./AppOffersTable";
import ContentRevealTitle from "./ContentRevealTitle";
import LocalAppsTable from "./LocalAppsTable";
import RemoteAppsTable from "./RemoteAppsTable";
import SearchResults from "./SearchResults/SearchResults";

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
  const modelUUID = useAppSelector((state) =>
    getModelUUIDFromList(state, modelName, userName),
  );
  const applications = useAppSelector((state) =>
    getModelApplications(state, modelUUID),
  );
  const localAppTableLength = applications
    ? Object.keys(applications).length
    : 0;

  const LocalAppChips = renderCounts("localApps", modelStatusData);
  const appOffersChips = renderCounts("offers", modelStatusData);
  const remoteAppChips = renderCounts("remoteApps", modelStatusData);

  const appOffersTableLength = modelStatusData
    ? Object.keys(modelStatusData?.offers).length
    : 0;

  const remoteAppsTableLength =
    modelName && userName && modelStatusData
      ? Object.keys(modelStatusData["remote-applications"]).length
      : 0;

  const countVisibleTables = (tablesLengths: number[]) =>
    tablesLengths.filter((rowLength) => rowLength > 0).length;

  const visibleTables = countVisibleTables([
    localAppTableLength,
    remoteAppsTableLength,
    appOffersTableLength,
  ]);

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
        {!!appOffersTableLength && <AppOffersTable />}
        {!!remoteAppsTableLength && <RemoteAppsTable />}
      </>
    );
  }
}
