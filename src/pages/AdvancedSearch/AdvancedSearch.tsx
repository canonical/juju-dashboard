import FadeIn from "animations/FadeIn";
import Header from "components/Header/Header";
import BaseLayout from "layout/BaseLayout/BaseLayout";

import SearchForm from "./SearchForm";

const AdvancedSearch = (): JSX.Element => (
  <BaseLayout>
    <Header>
      <b>Advanced search</b>
    </Header>
    <div className="l-content">
      <FadeIn isActive={true}>
        <SearchForm />
      </FadeIn>
    </div>
  </BaseLayout>
);

export default AdvancedSearch;
