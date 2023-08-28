import {
  CodeSnippet,
  CodeSnippetBlockAppearance,
  Spinner,
} from "@canonical/react-components";
import { isValid, parseISO } from "date-fns";
import { Highlight } from "prism-react-renderer";
import Prism from "prismjs/components/prism-core";
import { useEffect, useState } from "react";
import type { LabelRenderer, ValueRenderer } from "react-json-tree";
import { JSONTree } from "react-json-tree";
import "prismjs/components/prism-json";

import Status from "components/Status";
import { formatFriendlyDateToNow } from "components/utils";
import { actions as jujuActions } from "store/juju";
import {
  getCrossModelQueryLoaded,
  getCrossModelQueryLoading,
  getCrossModelQueryResults,
} from "store/juju/selectors";
import { useAppDispatch, useAppSelector } from "store/store";
import { ModelTab } from "urls";

import "./_results-block.scss";
import ResultsModelLink from "../ResultsModelLink";

export enum TestId {
  LOADING = "loading",
}

enum CodeSnippetView {
  TREE = "tree",
  JSON = "json",
}

const DEFAULT_THEME_COLOUR = "#00000099";

const THEME = {
  scheme: "Vanilla",
  base00: "#00000000",
  base01: DEFAULT_THEME_COLOUR,
  base02: DEFAULT_THEME_COLOUR,
  base03: DEFAULT_THEME_COLOUR,
  base04: DEFAULT_THEME_COLOUR,
  base05: DEFAULT_THEME_COLOUR,
  base06: DEFAULT_THEME_COLOUR,
  base07: "#000000",
  base08: "#a86500",
  base09: "#c7162b",
  base0A: DEFAULT_THEME_COLOUR,
  base0B: "#0e811f",
  base0C: DEFAULT_THEME_COLOUR,
  base0D: "#77216f",
  base0E: DEFAULT_THEME_COLOUR,
  base0F: DEFAULT_THEME_COLOUR,
};

const getTab = (key: string) => {
  switch (key) {
    case "applications":
    case "offers":
      return ModelTab.APPS;
    case "machines":
      return ModelTab.MACHINES;
    case "relations":
      return ModelTab.INTEGRATIONS;
    default:
      return;
  }
};

const labelRenderer: LabelRenderer = (keyPath) => {
  const currentKey = keyPath[0];
  // The last item in keyPath should always be the model UUID.
  const modelUUID = keyPath[keyPath.length - 1];
  if (!modelUUID || typeof modelUUID !== "string") {
    // If this is not a value that can be displayed then display "[none]" instead.
    return <span className="u-text--muted">[none]:</span>;
  }
  // If this is a top level key then it is a model UUID.
  if (keyPath.length === 1) {
    return (
      <ResultsModelLink
        replaceLabel
        title={`UUID: ${modelUUID}`}
        uuid={modelUUID}
      />
    );
  }
  switch (currentKey) {
    case "applications":
    case "machines":
    case "offers":
    case "relations":
    case "model":
      return (
        <ResultsModelLink uuid={modelUUID} view={getTab(currentKey)}>
          {currentKey}
        </ResultsModelLink>
      );
    // Display something when the key is a blank string.
    case "":
      return <span className="u-text--muted">[none]:</span>;
    default:
      return <>{currentKey}:</>;
  }
};

const valueRenderer: ValueRenderer = (valueAsString, value, ...keyPath) => {
  const currentKey = keyPath[0];
  const parentKey = keyPath.length >= 2 ? keyPath[1] : null;
  // Match a status of the following structure:
  //   "application-status": {
  //     "current": "unknown",
  //     ...
  //   }
  if (
    currentKey === "current" &&
    typeof parentKey === "string" &&
    parentKey.endsWith("-status") &&
    typeof value === "string" &&
    typeof valueAsString === "string"
  ) {
    return <Status status={value}>{valueAsString}</Status>;
  }
  // Display date values as tooltip with relative date.
  if (typeof value === "string" && isValid(parseISO(value))) {
    return (
      <>
        {value}{" "}
        <span className="u-text--muted">
          ({formatFriendlyDateToNow(value)})
        </span>
      </>
    );
  }
  return <>{valueAsString}</>;
};

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
    <Highlight code={resultsJSON} language="json" prism={Prism}>
      {({ tokens, getLineProps, getTokenProps }) => (
        <CodeSnippet
          className="results-block"
          blocks={[
            {
              appearance:
                codeSnippetView === CodeSnippetView.JSON
                  ? CodeSnippetBlockAppearance.NUMBERED
                  : undefined,
              code:
                codeSnippetView === CodeSnippetView.JSON ? (
                  tokens.map((line, i) => {
                    const { style, ...lineProps } = getLineProps({ line });
                    return (
                      <span key={i} {...lineProps}>
                        {line.map((token, key) => {
                          const { style, ...tokenProps } = getTokenProps({
                            token,
                          });
                          return <span key={key} {...tokenProps} />;
                        })}
                      </span>
                    );
                  })
                ) : (
                  <JSONTree
                    data={crossModelQueryResults}
                    hideRoot
                    labelRenderer={labelRenderer}
                    shouldExpandNodeInitially={(keyPath, data, level) =>
                      level <= 2
                    }
                    theme={THEME}
                    valueRenderer={valueRenderer}
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
    </Highlight>
  );
};

export default ResultsBlock;
