import {
  CodeSnippet,
  CodeSnippetBlockAppearance,
} from "@canonical/react-components";
import { isEqual } from "lodash";
import { useState } from "react";
import { JSONTree } from "react-json-tree";

import type { CrossModelQueryResponse } from "juju/jimm-facade";
import {
  getCrossModelQueryErrors,
  getCrossModelQueryLoading,
} from "store/juju/selectors";
import { useAppSelector } from "store/store";

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
  base0D: "#000000",
  base0E: DEFAULT_THEME_COLOUR,
  base0F: DEFAULT_THEME_COLOUR,
};

const ErrorsBlock = (): JSX.Element | null => {
  const isCrossModelQueryLoading = useAppSelector(getCrossModelQueryLoading);
  const crossModelQueryErrors = useAppSelector(getCrossModelQueryErrors);
  const [codeSnippetView, setCodeSnippetView] = useState<CodeSnippetView>(
    CodeSnippetView.TREE
  );
  const errorsJSON = JSON.stringify(crossModelQueryErrors, null, 2);

  const hasEqualErrors = (errors: CrossModelQueryResponse["errors"]) => {
    const firstError = Object.values(errors)[0].slice().sort();
    return Object.values(errors).reduce(
      (result, error) => result && isEqual(error.slice().sort(), firstError),
      true
    );
  };

  if (isCrossModelQueryLoading || crossModelQueryErrors === null) {
    return null;
  }

  if (
    typeof crossModelQueryErrors === "string" ||
    hasEqualErrors(crossModelQueryErrors)
  ) {
    return (
      <>
        <hr />
        <p className="u-no-margin--bottom">Error:</p>
        {typeof crossModelQueryErrors === "string" ? (
          <p>{crossModelQueryErrors}</p>
        ) : (
          Object.values(crossModelQueryErrors)[0].map((error) => (
            <p className="u-no-margin--bottom">{error}</p>
          ))
        )}
      </>
    );
  }

  return (
    <CodeSnippet
      className="errors-block"
      blocks={[
        {
          title: "Errors",
          appearance:
            codeSnippetView === CodeSnippetView.JSON
              ? CodeSnippetBlockAppearance.NUMBERED
              : undefined,
          code:
            codeSnippetView === CodeSnippetView.JSON ? (
              errorsJSON
            ) : (
              <JSONTree
                data={crossModelQueryErrors}
                hideRoot
                shouldExpandNodeInitially={(keyPath, data, level) => level <= 1}
                theme={THEME}
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
  );
};

export default ErrorsBlock;
