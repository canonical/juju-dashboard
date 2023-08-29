import { Spinner } from "@canonical/react-components";
import { useEffect } from "react";

import { actions as jujuActions } from "store/juju";
import {
  getCrossModelQueryErrors,
  getCrossModelQueryLoaded,
  getCrossModelQueryLoading,
  getCrossModelQueryResults,
} from "store/juju/selectors";
import { useAppDispatch, useAppSelector } from "store/store";

import "./_results-block.scss";
import CodeSnippetBlock from "../CodeSnippetBlock/CodeSnippetBlock";

export enum TestId {
  LOADING = "loading",
}

const ResultsBlock = (): JSX.Element | null => {
  const dispatch = useAppDispatch();
  const isCrossModelQueryLoading = useAppSelector(getCrossModelQueryLoading);
  const isCrossModelQueryLoaded = useAppSelector(getCrossModelQueryLoaded);
  const crossModelQueryResults = useAppSelector(getCrossModelQueryResults);
  const crossModelQueryErrors = useAppSelector(getCrossModelQueryErrors);

  useEffect(
    () => () => {
      // Clear cross-model query results when component is unmounted.
      dispatch(jujuActions.clearCrossModelQuery());
    },
    [dispatch]
  );

  // The loading state needs to be first so that it appears even if the results
  // have never loaded.
  if (isCrossModelQueryLoading) {
    return (
      <div className="u-align--center">
        <div className="u-sv3">
          <hr />
        </div>
        <Spinner data-testid={TestId.LOADING} />
      </div>
    );
  }

  if (!isCrossModelQueryLoaded || !!crossModelQueryErrors) {
    return null;
  }

  return (
    <CodeSnippetBlock
      className="results-block"
      title="Results"
      code={crossModelQueryResults}
    />
  );
};

export default ResultsBlock;
