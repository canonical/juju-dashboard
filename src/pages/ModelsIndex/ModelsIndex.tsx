import { SearchAndFilter, Spinner } from "@canonical/react-components";
import { SearchAndFilterChip } from "@canonical/react-components/dist/components/SearchAndFilter/types";
import { useSelector } from "react-redux";

import ButtonGroup from "components/ButtonGroup/ButtonGroup";
import ChipGroup from "components/ChipGroup/ChipGroup";
import Header from "components/Header/Header";
import ModelTableList from "components/ModelTableList/ModelTableList";
import BaseLayout from "layout/BaseLayout/BaseLayout";

import useModelAttributes from "hooks/useModelAttributes";

import useWindowTitle from "hooks/useWindowTitle";

import FadeIn from "animations/FadeIn";

import { pluralize } from "store/juju/utils/models";

import {
  ArrayParam,
  StringParam,
  useQueryParam,
  useQueryParams,
  withDefault,
} from "use-query-params";

import {
  getGroupedModelStatusCounts,
  getModelData,
} from "store/juju/selectors";

import "./_models.scss";

export default function Models() {
  useWindowTitle("Models");
  // Grab filter from 'groupedby' query in URL and assign to variable
  const [groupModelsBy, setGroupModelsBy] = useQueryParam(
    "groupedby",
    withDefault(StringParam, "status")
  );

  const [filters, setFilters] = useQueryParams({
    cloud: withDefault(ArrayParam, []),
    owner: withDefault(ArrayParam, []),
    region: withDefault(ArrayParam, []),
    credential: withDefault(ArrayParam, []),
    custom: withDefault(ArrayParam, []),
  });

  // loop model data and pull out filter panel data
  const modelData = useSelector(getModelData);
  const { clouds, regions, owners, credentials } =
    useModelAttributes(modelData);

  // Generate chips from available model data
  const generateChips = (lead: string, values: string[]) => {
    let chipValues: SearchAndFilterChip[] = [];
    values.forEach((value) => {
      chipValues.push({ lead, value });
    });
    return chipValues;
  };

  const { blocked, alert, running } = useSelector(getGroupedModelStatusCounts);

  let activeFilters: Record<string, string[]> = {};

  const isObjectsEqual = (
    obj1: Record<string, unknown>,
    obj2: Record<string, unknown>
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
  const modelsLoaded = modelCount > 0;

  return (
    <BaseLayout>
      <Header>
        <div className="models__header" data-disabled={modelCount === 0}>
          <strong className="models__count">
            {modelCount} {pluralize(modelCount, "model")}
          </strong>
          <ButtonGroup
            activeButton={groupModelsBy}
            buttons={["status", "cloud", "owner"]}
            label="Group by:"
            setActiveButton={setGroupModelsBy}
          />
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
                setFilters(activeFilters);
              }
            }}
          />
        </div>
      </Header>

      {modelsLoaded ? (
        <FadeIn isActive={modelsLoaded}>
          <div className="l-content">
            <div className="models">
              <ChipGroup chips={{ blocked, alert, running }} />
              <ModelTableList groupedBy={groupModelsBy} filters={filters} />
            </div>
          </div>
        </FadeIn>
      ) : (
        <div className="entity-details__loading">
          <Spinner />
        </div>
      )}
    </BaseLayout>
  );
}
