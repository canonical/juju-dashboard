import {
  CodeSnippet,
  CodeSnippetBlockAppearance,
} from "@canonical/react-components";
import { useState } from "react";
import {
  JSONTree,
  type LabelRenderer,
  type ValueRenderer,
} from "react-json-tree";

import ModelDetailsLink from "components/ModelDetailsLink";
import Status from "components/Status";
import { type CrossModelQueryResponse } from "juju/jimm-facade";

import { CodeSnippetView } from "../types";

type Props = {
  className: string;
  title: string;
  code:
    | CrossModelQueryResponse["results"]
    | CrossModelQueryResponse["errors"]
    | null; // TODO: remove after merging with cross-model-query
};

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

const labelRenderer: LabelRenderer = (keyPath) => {
  const currentKey = keyPath[0];
  // If this is a top level key then it is a model UUID.
  if (keyPath.length === 1) {
    return (
      <ModelDetailsLink
        // Prevent toggling the object when the link is clicked.
        onClick={(event) => event.stopPropagation()}
        title={`UUID: ${currentKey}`}
        uuid={currentKey.toString()}
      >
        {currentKey}:
      </ModelDetailsLink>
    );
  }
  return <>{currentKey}:</>;
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
  return <>{valueAsString}</>;
};

const CodeSnippetBlock = ({ className, title, code }: Props): JSX.Element => {
  const [codeSnippetView, setCodeSnippetView] = useState<CodeSnippetView>(
    CodeSnippetView.TREE
  );

  return (
    <CodeSnippet
      className={className}
      blocks={[
        {
          title,
          appearance:
            codeSnippetView === CodeSnippetView.JSON
              ? CodeSnippetBlockAppearance.NUMBERED
              : undefined,
          code:
            codeSnippetView === CodeSnippetView.JSON ? (
              JSON.stringify(code, null, 2)
            ) : (
              <JSONTree
                data={code}
                hideRoot
                labelRenderer={labelRenderer}
                shouldExpandNodeInitially={(keyPath, data, level) => level <= 2}
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

export default CodeSnippetBlock;
