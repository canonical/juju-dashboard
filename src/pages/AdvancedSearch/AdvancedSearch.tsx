import type { JSX } from "react";

import CheckPermissions from "components/CheckPermissions";
import MainContent from "layout/MainContent";
import { isCrossModelQueriesEnabled } from "store/general/selectors";
import { useAppSelector } from "store/store";
import { testId } from "testing/utils";

import ErrorsBlock from "./ErrorsBlock";
import ResultsBlock from "./ResultsBlock";
import SearchForm from "./SearchForm";
import { Label, TestId } from "./types";

const AdvancedSearch = (): JSX.Element => {
  const crossModelQueriesEnabled = useAppSelector(isCrossModelQueriesEnabled);
  return (
    <CheckPermissions
      allowed={crossModelQueriesEnabled}
      {...testId(TestId.COMPONENT)}
    >
      <MainContent {...testId(TestId.COMPONENT)} title={Label.TITLE}>
        <SearchForm />
        <ErrorsBlock />
        <ResultsBlock />
      </MainContent>
    </CheckPermissions>
  );
};

export default AdvancedSearch;
