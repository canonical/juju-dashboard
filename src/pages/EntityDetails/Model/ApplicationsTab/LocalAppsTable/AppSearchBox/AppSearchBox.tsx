import { SearchBox } from "@canonical/react-components";
import type { FC } from "react";
import { useState } from "react";
import { useDispatch } from "react-redux";

import { useQueryParams } from "hooks/useQueryParams";
import { actions as jujuActions } from "store/juju";
import { testId } from "testing/utils";

const AppSearchBox: FC = () => {
  const dispatch = useDispatch();
  const [query, setQuery] = useQueryParams<{
    filterQuery: string;
    filterType: null | string;
  }>({
    filterQuery: "",
    filterType: null,
  });
  const [filterQuery, setFilterQuery] = useState(query.filterQuery);

  const updateQuery = (queryString: string): void => {
    // Clear any previously selected apps as they might not exist in the new
    // search results.
    dispatch(
      jujuActions.updateSelectedApplications({
        selectedApplications: [],
      }),
    );
    setQuery({ filterQuery: queryString });
  };

  return (
    <form
      className="u-flex-grow"
      onSubmit={(event) => {
        event.preventDefault();
        updateQuery(filterQuery);
      }}
    >
      <SearchBox
        className="u-no-margin"
        placeholder="Filter applications"
        onSearch={() => {
          updateQuery(filterQuery);
        }}
        onClear={() => {
          updateQuery("");
        }}
        onChange={setFilterQuery}
        externallyControlled
        {...testId("filter-applications")}
        value={filterQuery}
      />
    </form>
  );
};

export default AppSearchBox;
