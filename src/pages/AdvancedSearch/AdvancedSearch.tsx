import BaseLayout from "layout/BaseLayout/BaseLayout";

import ErrorsBlock from "./ErrorsBlock";
import ResultsBlock from "./ResultsBlock";
import SearchForm from "./SearchForm";

const AdvancedSearch = (): JSX.Element => (
  <BaseLayout title="Advanced search">
    <SearchForm />
    <ErrorsBlock />
    <ResultsBlock />
  </BaseLayout>
);

export default AdvancedSearch;
