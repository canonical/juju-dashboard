import { RadioInput } from "@canonical/react-components";
import type { FormEvent, MouseEvent } from "react";

import type { ConfigProps } from "./ConfigField";
import ConfigField from "./ConfigField";

export default function BooleanConfig({
  config,
  selectedConfig,
  setSelectedConfig,
  setNewValue,
}: ConfigProps): JSX.Element {
  function handleOptionChange(
    e: FormEvent<HTMLInputElement> | MouseEvent<HTMLInputElement>
  ) {
    const target = e.target as HTMLInputElement;
    const bool = target.value === "true" ? true : false;
    setNewValue(target.name, bool);
  }

  return (
    <ConfigField<boolean>
      config={config}
      selectedConfig={selectedConfig}
      setSelectedConfig={setSelectedConfig}
      setNewValue={setNewValue}
      input={(value) => (
        <div className="row">
          <div className="col-2">
            <RadioInput
              label="true"
              name={config.name}
              aria-labelledby={config.name}
              checked={value === true}
              value="true"
              onClick={handleOptionChange}
              onChange={handleOptionChange}
            />
          </div>
          <div className="col-2">
            <RadioInput
              label="false"
              name={config.name}
              aria-labelledby={config.name}
              checked={value === false}
              value="false"
              onClick={handleOptionChange}
              onChange={handleOptionChange}
            />
          </div>
        </div>
      )}
    />
  );
}
