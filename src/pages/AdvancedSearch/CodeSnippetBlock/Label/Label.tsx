import type { KeyPath, LabelRenderer } from "react-json-tree";

import AppLink from "components/AppLink";
import MachineLink from "components/MachineLink";
import UnitLink from "components/UnitLink";
import ResultsModelLink from "pages/AdvancedSearch/ResultsModelLink";

import { getTab } from "./utils";

type Props = {
  keyPath: KeyPath;
};

const Label = ({ keyPath }: Props): ReturnType<LabelRenderer> => {
  const currentKey = keyPath[0];
  const parentKey = keyPath.length >= 2 ? keyPath[1] : null;
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
  // Link units[unit-key] to unit in model details.
  if (parentKey === "units" && typeof currentKey === "string") {
    // NOTE: See `generateUnitURL@tableRows.tsx` for a similar implementation
    const [appName, index] = currentKey.split("/");
    const unitId = `${appName}-${index}`;
    return (
      <UnitLink uuid={modelUUID} appName={appName} unitId={unitId}>
        {currentKey}:
      </UnitLink>
    );
  }
  // Link machines[machine-key] to machine in model details.
  if (parentKey === "machines" && typeof currentKey === "string") {
    return (
      <MachineLink uuid={modelUUID} machineId={currentKey}>
        {currentKey}:
      </MachineLink>
    );
  }
  // Link offers[app-key] and applications[app-key] to app in model details.
  if (
    (parentKey === "offers" || parentKey === "applications") &&
    typeof currentKey === "string"
  ) {
    return (
      <AppLink uuid={modelUUID} appName={currentKey}>
        {currentKey}:
      </AppLink>
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

export default Label;
