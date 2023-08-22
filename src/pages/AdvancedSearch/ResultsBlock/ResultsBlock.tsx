import {
  CodeSnippet,
  CodeSnippetBlockAppearance,
  Spinner,
} from "@canonical/react-components";
import { useState } from "react";

import {
  getCrossModelQueryLoaded,
  getCrossModelQueryLoading,
  getCrossModelQueryResults,
} from "store/juju/selectors";
import { useAppSelector } from "store/store";

enum CodeSnippetView {
  TREE = "tree",
  JSON = "json",
}

const ResultsBlock = (): JSX.Element | null => {
  const isCrossModelQueryLoading = useAppSelector(getCrossModelQueryLoading);
  const isCrossModelQueryLoaded = useAppSelector(getCrossModelQueryLoaded);
  const crossModelQueryResults = useAppSelector(getCrossModelQueryResults);
  const [codeSnippetView, setCodeSnippetView] = useState<CodeSnippetView>(
    CodeSnippetView.TREE
  );
  const codeSnippetContent = {
    tree: "",
    json: JSON.stringify(crossModelQueryResults, null, 2),
  };

  if (isCrossModelQueryLoading) {
    return (
      <div className="u-align--center">
        <div className="u-sv3">
          <hr />
        </div>
        <Spinner />
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
            code: codeSnippetContent[codeSnippetView],
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
