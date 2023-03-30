import { Icon } from "@canonical/react-components";
import SearchBox from "components/SearchBox/SearchBox";
import { useEffect, useMemo, useRef, useState } from "react";
import { StringParam, useQueryParams, withDefault } from "use-query-params";
import "./_applications_search.scss";

type ApplicationsQueryMode = "simple" | "jq" | "SQL";

const ApplicationQueryOption = (props: {
  queryMode: ApplicationsQueryMode;
  mode: ApplicationsQueryMode;
  text?: string;
  onClick: (mode: ApplicationsQueryMode) => void;
}) => {
  if (props.queryMode === props.mode) return null;
  return (
    <button
      className="p-contextual-menu__link"
      onClick={() => props.onClick(props.mode)}
    >
      {props.text || props.mode}
    </button>
  );
};

export const SimpleQueryInput = (props: {
  onSubmit: (query: string) => void;
}) => {
  const [query] = useQueryParams({
    filterQuery: withDefault(StringParam, ""),
  });
  const searchBoxRef = useRef<HTMLInputElement>(null);
  const handleFilterSubmit = () => {
    const filterQuery = searchBoxRef.current?.value || "";
    props.onSubmit(filterQuery);
  };
  useEffect(() => {
    // set value from the URL
    if (searchBoxRef.current) searchBoxRef.current.value = query.filterQuery;
  }, [query.filterQuery]);
  return (
    <SearchBox
      className="u-no-margin"
      placeholder="Filter applications"
      onKeyDown={(e) => {
        if (e.code === "Enter") handleFilterSubmit();
      }}
      onSearch={handleFilterSubmit}
      onClear={handleFilterSubmit}
      externallyControlled
      ref={searchBoxRef}
      autoComplete="off"
      data-testid="filter-applications"
    />
  );
};
export const AdvancedQueryInput = (props: {
  type: "SQL" | "jq";
  onSubmit: (query: string) => void;
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
    // auto focus when switching to advanced mode
    inputRef.current?.focus();
  }, []);
  const handleFilterSubmit = () => {
    const filterQuery = inputRef.current?.value || "";
    props.onSubmit(filterQuery);
  };

  return (
    <SearchBox
      className="u-no-margin advanced-query-input"
      placeholder={`${props.type} query`}
      onKeyDown={(e) => {
        if (e.code === "Enter") handleFilterSubmit();
      }}
      onSearch={handleFilterSubmit}
      externallyControlled
      ref={inputRef}
      autoComplete="off"
      customSearchIcon={
        <Icon name="run-action" title={`Run the ${props.type} query`} />
      }
      hideClearButton
    />
  );
};
export const ApplicationsSearch = () => {
  const [queryMode, setQueryMode] = useState<ApplicationsQueryMode>("simple");
  const [showContextualMenu, setShowContextualMenu] = useState(false);
  const [, setQuery] = useQueryParams({
    filterQuery: StringParam,
  });
  // const isJuju = useSelector(getConfig)?.isJuju || true;
  const isJuju = false;
  const handleFilterSubmit = (filterQuery: string) => {
    setQuery({ filterQuery });
  };

  const handleQueryModeChange = (mode: ApplicationsQueryMode) => {
    setQueryMode(mode);
    setShowContextualMenu(false);
  };

  const queryInput = useMemo(() => {
    if (queryMode === "simple")
      return <SimpleQueryInput onSubmit={handleFilterSubmit} />;
    else {
      // remove the filter query from the URL
      setQuery({ filterQuery: undefined });
      return (
        <AdvancedQueryInput
          key={queryMode}
          type={queryMode}
          onSubmit={handleFilterSubmit}
        />
      );
    }
  }, [queryMode]);

  return (
    <span
      className="p-contextual-menu--left"
      // advanced search is only supported in JAAS
      onFocus={() => !isJuju && setShowContextualMenu(true)}
      onBlur={() => !isJuju && setShowContextualMenu(false)}
    >
      {queryInput}
      <div
        className="p-contextual-menu__dropdown"
        aria-hidden="false"
        data-show={showContextualMenu}
      >
        <span className="p-contextual-menu__title">Switch mode to:</span>
        <ApplicationQueryOption
          mode="simple"
          text="Simple"
          queryMode={queryMode}
          onClick={handleQueryModeChange}
        />
        <ApplicationQueryOption
          mode="jq"
          text="Advanced - jq"
          queryMode={queryMode}
          onClick={handleQueryModeChange}
        />
        <ApplicationQueryOption
          mode="SQL"
          text="Advanced - SQL"
          queryMode={queryMode}
          onClick={handleQueryModeChange}
        />
      </div>
    </span>
  );
};
