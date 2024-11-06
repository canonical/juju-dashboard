import {
  Button,
  Notification,
  SearchAndFilter,
} from "@canonical/react-components";
import type { SearchAndFilterChip } from "@canonical/react-components/dist/components/SearchAndFilter/types";
import type { ReactNode } from "react";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";

import ChipGroup from "components/ChipGroup";
import LoadingSpinner from "components/LoadingSpinner";
import ModelTableList from "components/ModelTableList";
import SegmentedControl from "components/SegmentedControl";
import useModelAttributes from "hooks/useModelAttributes";
import { useQueryParams } from "hooks/useQueryParams";
import useWindowTitle from "hooks/useWindowTitle";
import BaseLayout from "layout/BaseLayout";
import {
  getGroupedModelStatusCounts,
  getModelData,
  getModelListLoaded,
  getModelsError,
  hasModels,
} from "store/juju/selectors";
import { pluralize } from "store/juju/utils/models";
import { useAppSelector } from "store/store";
import type { ModelsGroupedBy } from "urls";
import urls from "urls";

import "./_models.scss";
import { Label, TestId } from "./types";

export default function Models() {
  useWindowTitle("Models");

  const [queryParams, setQueryParams] = useQueryParams<{
    groupedby: string;
    cloud: string[];
    owner: string[];
    region: string[];
    credential: string[];
    custom: string[];
  }>({
    groupedby: "status",
    cloud: [],
    owner: [],
    region: [],
    credential: [],
    custom: [],
  });
  const filters = {
    cloud: queryParams.cloud,
    owner: queryParams.owner,
    region: queryParams.region,
    credential: queryParams.credential,
    custom: queryParams.custom,
  };

  const modelsError = useAppSelector(getModelsError);
  const modelsLoaded = useAppSelector(getModelListLoaded);
  const hasSomeModels = useSelector(hasModels);
  // loop model data and pull out filter panel data
  const modelData = useSelector(getModelData);
  const { clouds, regions, owners, credentials } =
    useModelAttributes(modelData);

  // Generate chips from available model data
  const generateChips = (lead: string, values: string[]) => {
    const chipValues: SearchAndFilterChip[] = [];
    values.forEach((value) => {
      chipValues.push({ lead, value });
    });
    return chipValues;
  };

  const { blocked, alert, running } = useSelector(getGroupedModelStatusCounts);

  let activeFilters: Record<string, string[]> = {};

  const isObjectsEqual = (
    obj1: Record<string, unknown>,
    obj2: Record<string, unknown>,
  ) => JSON.stringify(obj1) === JSON.stringify(obj2);

  const existingSearchData: SearchAndFilterChip[] = [];
  for (const [lead, values] of Object.entries(filters)) {
    values.forEach((value) => {
      if (value) {
        existingSearchData.push({ lead, value });
      }
    });
  }

  const modelCount = blocked + alert + running;

  let content: ReactNode;
  if (!modelsLoaded) {
    return <LoadingSpinner />;
  } else if (!hasSomeModels) {
    content = (
      <div className="models">
        <h3>{Label.NOT_FOUND}</h3>
        <p>
          Learn about{" "}
          <a href="https://juju.is/docs/olm/manage-models#heading--add-a-model">
            adding models
          </a>{" "}
          or{" "}
          <a href="https://juju.is/docs/olm/manage-users#heading--model-access">
            granting access
          </a>{" "}
          to existing models.
        </p>
      </div>
    );
  } else {
    content = (
      <div className="models">
        <ChipGroup chips={{ blocked, alert, running }} />
        <ModelTableList groupedBy={queryParams.groupedby} filters={filters} />
      </div>
    );
  }

  return (
    <BaseLayout
      data-testid={TestId.COMPONENT}
      title={
        <div className="models__header" data-disabled={modelCount === 0}>
          <span className="u-hide u-show--large">
            {modelCount} {pluralize(modelCount, "model")}
          </span>
          <span className="models__header-controls">
            <span className="p-text--default">Group by: </span>
            <SegmentedControl
              className="u-display--inline-block"
              activeButton={queryParams.groupedby}
              buttons={["Status", "Cloud", "Owner"].map((group) => ({
                children: group,
                key: group.toLowerCase(),
                to: urls.models.group({
                  groupedby: group.toLowerCase() as ModelsGroupedBy,
                }),
              }))}
              buttonComponent={Link}
            />
          </span>
          <SearchAndFilter
            filterPanelData={[
              {
                id: 0,
                heading: "Cloud",
                chips: generateChips("Cloud", clouds),
              },
              {
                id: 1,
                heading: "Region",
                chips: generateChips("Region", regions),
              },
              {
                id: 2,
                heading: "Owner",
                chips: generateChips("Owner", owners),
              },
              {
                id: 3,
                heading: "Credential",
                chips: generateChips("Credential", credentials),
              },
            ]}
            existingSearchData={existingSearchData}
            returnSearchData={(searchData) => {
              // Reset active filters
              activeFilters = {
                cloud: [],
                owner: [],
                region: [],
                credential: [],
                custom: [],
              };

              // Loop search data and pull out each filter
              searchData.length &&
                searchData.forEach(({ lead, value }) => {
                  const chipLead = lead ? lead.toLowerCase() : "custom";
                  if (!(chipLead in activeFilters)) {
                    activeFilters[chipLead] = [];
                  }
                  activeFilters[chipLead].push(value);
                });

              if (!isObjectsEqual(activeFilters, filters)) {
                setQueryParams(activeFilters);
              }
            }}
          />
        </div>
      }
      titleComponent="div"
      titleClassName="u-no-max-width u-full-width"
    >
      {modelsError ? (
        <Notification severity="negative" title="Error">
          {modelsError} Try{" "}
          <Button appearance="link" onClick={() => window.location.reload()}>
            refreshing
          </Button>{" "}
          the page.
        </Notification>
      ) : null}
      {content}
    </BaseLayout>
  );
}
