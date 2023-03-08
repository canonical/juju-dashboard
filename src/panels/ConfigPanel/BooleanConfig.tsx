import { RadioInput } from "@canonical/react-components";
import ConfigField, { ConfigProps } from "./ConfigField";

export default function BooleanConfig({
  config,
  selectedConfig,
  setSelectedConfig,
  setNewValue,
}: ConfigProps): JSX.Element {
  function handleOptionChange(e: any) {
    const bool = e.target.value === "true" ? true : false;
    setNewValue(e.target.name, bool);
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
