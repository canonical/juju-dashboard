import {
  CodeSnippet,
  CodeSnippetBlockAppearance,
} from "@canonical/react-components";
import { isValid, parseISO } from "date-fns";
import { Highlight } from "prism-react-renderer";
import Prism from "prismjs/components/prism-core";
import { useCallback, useState } from "react";
import type { KeyPath } from "react-json-tree";
import { JSONTree, type ValueRenderer } from "react-json-tree";
import "prismjs/components/prism-json";

import AppLink from "components/AppLink";
import MachineLink from "components/MachineLink";
import Status from "components/Status";
import { formatFriendlyDateToNow } from "components/utils";
import { type CrossModelQueryResponse } from "juju/jimm/JIMMV4";
import type { CrossModelQueryState } from "store/juju/types";

import { CodeSnippetView } from "../types";

import Label from "./Label";

type Props = {
  className: string;
  title: string;
  code: CrossModelQueryResponse["results"] | CrossModelQueryResponse["errors"];
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
  base0D: "#77216f",
  base0E: DEFAULT_THEME_COLOUR,
  base0F: DEFAULT_THEME_COLOUR,
};

// Use a key path to get the parent object that contains the current item from the results data.
const getCurrentObject = (
  keyPath: KeyPath,
  results: CrossModelQueryState["results"],
) =>
  keyPath
    // Ignore the first item, as we want to get the parent object.
    .slice(1, keyPath.length)
    // The first item in the key path is the current parameter and then has
    // the parents in ascending order (e.g. [current, parent, grandparent]),
    // but we need to follow the path from the outside in.
    .reverse()
    // This reduce follows the keypath by returning the next child until it
    // finally reaches the end.
    .reduce<object | null>((current, key) => {
      // Check that the current item in the path is a valid object.
      if (current && typeof current === "object" && key in current) {
        const inner = current[key as keyof typeof current];
        // Check that the next child is a valid object.
        if (typeof inner === "object") {
          // Store the next child.
          return inner;
        }
      }
      // Handle the case where the key path does not match the object that was provided.
      return null;
    }, results);

const CodeSnippetBlock = ({ className, title, code }: Props): JSX.Element => {
  const [codeSnippetView, setCodeSnippetView] = useState<CodeSnippetView>(
    CodeSnippetView.TREE,
  );

  const valueRenderer = useCallback<ValueRenderer>(
    (valueAsString, value, ...keyPath) => {
      const currentKey = keyPath[0];
      const parentKey = keyPath.length >= 2 ? keyPath[1] : null;
      const grandparentKey = keyPath.length >= 3 ? keyPath[2] : null;
      const modelUUID = keyPath[keyPath.length - 1];
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
      // Match charms with the following structure:
      //   "charm": "mysql",
      //   "charm-channel": "8.0/stable",
      //   "charm-name": "mysql",
      //   "charm-origin": "charmhub",
      if (currentKey === "charm" && typeof valueAsString === "string") {
        const currentObject = getCurrentObject(keyPath, code);
        if (
          currentObject &&
          "charm-name" in currentObject &&
          currentObject["charm-name"] &&
          "charm-origin" in currentObject &&
          currentObject["charm-origin"] === "charmhub"
        ) {
          let charmURL = `https://charmhub.io/${currentObject["charm-name"]}`;
          if (
            "charm-channel" in currentObject &&
            currentObject["charm-channel"]
          ) {
            charmURL += `?channel=${currentObject["charm-channel"]}`;
          }
          return (
            <a href={charmURL} target="_blank" rel="noopener noreferrer">
              {valueAsString}
            </a>
          );
        }
      }
      // Link units[unit-key].machine to machine in model details.
      if (
        grandparentKey === "units" &&
        currentKey === "machine" &&
        typeof valueAsString === "string" &&
        typeof value === "string" &&
        typeof modelUUID === "string"
      ) {
        return (
          <MachineLink uuid={modelUUID} machineId={value}>
            {valueAsString}
          </MachineLink>
        );
      }
      // Link relations[key][app-key] and 'subordinate-to'[value]
      // to app in model details.
      if (
        (grandparentKey === "relations" || parentKey === "subordinate-to") &&
        typeof valueAsString === "string" &&
        typeof value === "string" &&
        typeof modelUUID === "string"
      ) {
        return (
          <AppLink uuid={modelUUID} appName={value}>
            {valueAsString}
          </AppLink>
        );
      }
      // Link ‘application-endpoints’[app-key].url to the app in the
      // offer’s model details.
      if (
        grandparentKey === "application-endpoints" &&
        currentKey === "url" &&
        typeof valueAsString === "string" &&
        typeof parentKey === "string" &&
        typeof modelUUID === "string"
      ) {
        return (
          <AppLink uuid={modelUUID} appName={parentKey}>
            {valueAsString}
          </AppLink>
        );
      }
      return <>{valueAsString}</>;
    },
    [code],
  );

  return (
    <Highlight
      code={JSON.stringify(code, null, 2)}
      language="json"
      prism={Prism}
    >
      {({ tokens, getLineProps, getTokenProps }) => (
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
                  tokens.map((line, i) => {
                    const { style: _style, ...lineProps } = getLineProps({
                      line,
                    });
                    return (
                      <span key={i} {...lineProps}>
                        {line.map((token, key) => {
                          const { style: _style, ...tokenProps } =
                            getTokenProps({
                              token,
                            });
                          return <span key={key} {...tokenProps} />;
                        })}
                      </span>
                    );
                  })
                ) : (
                  <JSONTree
                    data={code}
                    hideRoot
                    labelRenderer={(keyPath) => <Label keyPath={keyPath} />}
                    shouldExpandNodeInitially={(_keyPath, _data, level) =>
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
                        .value as CodeSnippetView,
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

export default CodeSnippetBlock;
