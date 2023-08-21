import { CodeSnippet, Spinner } from "@canonical/react-components";
import { useEffect, useState } from "react";

import {
  getCrossModelQueryLoading,
  getCrossModelQueryResults,
} from "store/juju/selectors";
import { useAppSelector } from "store/store";

type CodeSnippetView = "tree" | "json";

const ResultsBlock = (): JSX.Element => {
  const isCrossModelQueryLoading = useAppSelector(getCrossModelQueryLoading);
  const [isCrossModelQueryRequestMade, setIsCrossModelQueryRequestMade] =
    useState<boolean>(false);
  const crossModelQueryResults = useAppSelector(getCrossModelQueryResults);

  const [codeSnippetView, setCodeSnippetView] =
    useState<CodeSnippetView>("tree");
  const codeSnippetContent = {
    tree: "Not sure yet how to implement the tree format.",
    json: JSON.stringify(crossModelQueryResults, null, 2),
  };

  useEffect(() => {
    if (!isCrossModelQueryRequestMade && isCrossModelQueryLoading) {
      setIsCrossModelQueryRequestMade(true);
    }
  }, [isCrossModelQueryLoading, isCrossModelQueryRequestMade]);

  if (!isCrossModelQueryRequestMade) {
    return <>Result from Advanced search will be shown here!</>;
  }

  return (
    <>
      {isCrossModelQueryLoading ? (
        <Spinner />
      ) : (
        <CodeSnippet
          blocks={[
            {
              code: codeSnippetContent[codeSnippetView],
              dropdowns: [
                {
                  options: [
                    {
                      value: "tree",
                      label: "Tree",
                    },
                    {
                      value: "json",
                      label: "JSON",
                    },
                  ],
                  value: codeSnippetView,
                  onChange: (
                    event:
                      | React.ChangeEvent<HTMLSelectElement>
                      | React.FormEvent<HTMLSelectElement>
                  ) => {
                    setCodeSnippetView(
                      (event.target as HTMLSelectElement)
                        .value as CodeSnippetView
                    );
                  },
                },
              ],
            },
          ]}
        />
      )}
    </>
  );
};

export default ResultsBlock;
