import type { ConfigProps } from "../ConfigField";
import ConfigField from "../ConfigField";

const NumberConfig = ({
  config,
  selectedConfig,
  setSelectedConfig,
  setNewValue,
}: ConfigProps): JSX.Element => {
  return (
    <ConfigField<number>
      config={config}
      selectedConfig={selectedConfig}
      setSelectedConfig={setSelectedConfig}
      setNewValue={setNewValue}
      input={(value) => (
        <input
          type="number"
          value={value}
          onFocus={() => setSelectedConfig(config)}
          onChange={(e) => {
            setNewValue(config.name, e.target.value);
          }}
        />
      )}
    />
  );
};

export default NumberConfig;
