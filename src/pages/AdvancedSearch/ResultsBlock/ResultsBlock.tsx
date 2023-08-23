import {
  CodeSnippet,
  CodeSnippetBlockAppearance,
  Spinner,
} from "@canonical/react-components";
import { useEffect, useState } from "react";
import { JSONTree } from "react-json-tree";

import { actions as jujuActions } from "store/juju";
import {
  getCrossModelQueryLoaded,
  getCrossModelQueryLoading,
  getCrossModelQueryResults,
} from "store/juju/selectors";
import { useAppDispatch, useAppSelector } from "store/store";

export enum TestId {
  LOADING = "loading",
}

enum CodeSnippetView {
  TREE = "tree",
  JSON = "json",
}

const ResultsBlock = (): JSX.Element | null => {
  const dispatch = useAppDispatch();
  const isCrossModelQueryLoading = useAppSelector(getCrossModelQueryLoading);
  const isCrossModelQueryLoaded = useAppSelector(getCrossModelQueryLoaded);
  const crossModelQueryResults = useAppSelector(getCrossModelQueryResults);
  const [codeSnippetView, setCodeSnippetView] = useState<CodeSnippetView>(
    CodeSnippetView.TREE
  );
  const resultsJSON = JSON.stringify(crossModelQueryResults, null, 2);

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

  if (!isCrossModelQueryLoaded) {
    return null;
  }

  return (
    <>
      <CodeSnippet
        blocks={[
          {
            appearance:
              codeSnippetView === CodeSnippetView.JSON
                ? CodeSnippetBlockAppearance.NUMBERED
                : undefined,
            code:
              codeSnippetView === CodeSnippetView.JSON ? (
                resultsJSON
              ) : (
                <JSONTree
                  data={crossModelQueryResults}
                  hideRoot
                  shouldExpandNodeInitially={(keyPath, data, level) =>
                    level <= 2
                  }
                />
              ),
            dropdowns: [
              {
                options: [
                  {
                    value: CodeSnippetView.TREE,
                    label: "Tree",
                  },
                  {
                    value: CodeSnippetView.JSON,
                    label: "JSON",
                  },
                ],
                value: codeSnippetView,
                onChange: (event) => {
                  setCodeSnippetView(
                    (event.target as HTMLSelectElement).value as CodeSnippetView
                  );
                },
              },
            ],
          },
        ]}
      />
    </>
  );
};

export default ResultsBlock;
