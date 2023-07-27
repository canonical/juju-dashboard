import { SearchBox, Icon, Switch, Tooltip } from "@canonical/react-components";
import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import { useQueryParams } from "hooks/useQueryParams";
import { getConfig } from "store/general/selectors";
import { actions as jujuActions } from "store/juju";

const AppSearchBox = () => {
  const dispatch = useDispatch();
  const isJuju = useSelector(getConfig)?.isJuju;
  const [query, setQuery] = useQueryParams<{
    filterQuery: string;
    filterType: string | null;
  }>({
    filterQuery: "",
    filterType: null,
  });
  const [filterQuery, setFilterQuery] = useState(query.filterQuery);

  const updateQuery = (query: string) => {
    // Clear any previously selected apps as they might not exist in the new
    // search results.
    dispatch(
      jujuActions.updateSelectedApplications({
        selectedApplications: [],
      })
    );
    setQuery({ filterQuery: query });
  };

  return (
    <form
      className="u-flex u-flex-grow"
      onSubmit={(event) => {
        event.preventDefault();
        updateQuery(filterQuery);
      }}
    >
      <SearchBox
        className="u-no-margin u-flex-grow"
        placeholder={
          query.filterType === "jq"
            ? "Filter applications using JQ"
            : "Filter applications"
        }
        onSearch={() => updateQuery(filterQuery)}
        onClear={() => updateQuery("")}
        onChange={setFilterQuery}
        externallyControlled
        data-testid="filter-applications"
        value={filterQuery}
      />
      {!isJuju ? (
        <div className="u-sph--large u-no-margin--right">
          <Switch
            checked={query.filterType === "jq"}
            label={
              <>
                JQ{" "}
                <Tooltip
                  position="btm-left"
                  //   TODO: add a link to the docs
                  message="Filter applications in this model using JQ. Find out more."
                >
                  <Icon name="help" />
                </Tooltip>
              </>
            }
            onChange={(event) => {
              const target = event.target as HTMLInputElement;
              setQuery({ filterType: target.checked ? "jq" : null });
            }}
          />
        </div>
      ) : null}
    </form>
  );
};

export default AppSearchBox;
