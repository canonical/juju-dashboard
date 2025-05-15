import type { JSX } from "react";

import CheckPermissions from "components/CheckPermissions";
import BaseLayout from "layout/BaseLayout/BaseLayout";
import { isCrossModelQueriesEnabled } from "store/general/selectors";
import { useAppSelector } from "store/store";

import ErrorsBlock from "./ErrorsBlock";
import ResultsBlock from "./ResultsBlock";
import SearchForm from "./SearchForm";
import { Label, TestId } from "./types";

const AdvancedSearch = (): JSX.Element => {
  const crossModelQueriesEnabled = useAppSelector(isCrossModelQueriesEnabled);
  return (
    <CheckPermissions
      allowed={crossModelQueriesEnabled}
      data-testid={TestId.COMPONENT}
    >
      <BaseLayout data-testid={TestId.COMPONENT} title={Label.TITLE}>
        <SearchForm />
        <ErrorsBlock />
        <ResultsBlock />
      </BaseLayout>
    </CheckPermissions>
  );
};

export default AdvancedSearch;
