import { useRef } from "react";
import ConfigField, { ConfigProps } from "./ConfigField";

export default function TextAreaConfig({
  config,
  selectedConfig,
  setSelectedConfig,
  setNewValue,
}: ConfigProps): JSX.Element {
  const inputRef = useRef<HTMLTextAreaElement>(null);

  return (
    <ConfigField<string>
      config={config}
      selectedConfig={selectedConfig}
      setSelectedConfig={setSelectedConfig}
      setNewValue={setNewValue}
      input={(value) => (
        <textarea
          ref={inputRef}
          value={value ?? ""}
          onFocus={() => setSelectedConfig(config)}
          onChange={(e) => {
            setNewValue(config.name, e.target.value);
          }}
        ></textarea>
      )}
    />
  );
}
