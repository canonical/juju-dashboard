import { isValid, parseISO } from "date-fns";
import type { ReactNode } from "react";
import type { KeyPath, ValueRenderer } from "react-json-tree";

import AppLink from "components/AppLink";
import MachineLink from "components/MachineLink";
import Status from "components/Status";
import { formatFriendlyDateToNow } from "components/utils";
import type { CrossModelQueryResponse } from "juju/jimm/JIMMV4";
import type { CrossModelQueryState } from "store/juju/types";

type Props = {
  valueAsString: unknown;
  value: unknown;
  keyPath: KeyPath;
  code: CrossModelQueryResponse["errors"] | CrossModelQueryResponse["results"];
};

// Use a key path to get the parent object that contains the current item from the results data.
const getCurrentObject = (
  keyPath: KeyPath,
  results: CrossModelQueryState["results"],
): null | object =>
  keyPath
    // Ignore the first item, as we want to get the parent object.
    .slice(1, keyPath.length)
    // The first item in the key path is the current parameter and then has
    // the parents in ascending order (e.g. [current, parent, grandparent]),
    // but we need to follow the path from the outside in.
    .reverse()
    // This reduce follows the keypath by returning the next child until it
    // finally reaches the end.
    .reduce<null | object>((current, key) => {
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

const Value = ({
  valueAsString,
  value,
  keyPath,
  code,
}: Props): ReturnType<ValueRenderer> => {
  const [currentKey] = keyPath;
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
      if ("charm-channel" in currentObject && currentObject["charm-channel"]) {
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
  return <>{valueAsString as ReactNode}</>;
};

export default Value;
