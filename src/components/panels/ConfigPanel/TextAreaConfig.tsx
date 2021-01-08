import { ReactElement, useEffect, useState } from "react";
import classnames from "classnames";

import type { ConfigProps } from "./ConfigPanel";

export default function TextAreaConfig({
  config,
  selectedConfig,
  setSelectedConfig,
}: ConfigProps): ReactElement {
  const [inputFocused, setInputFocused] = useState(false);

  let defaultValue = null;
  let placeholder = null;
  // Use the placeholder styling native to the browser if the config value
  // is equal to the default value of the config option.
  if (config.default === config.value) {
    placeholder = config.default;
  } else {
    defaultValue = config.value;
  }

  useEffect(() => {
    if (selectedConfig?.name === config.name) {
      setInputFocused(true);
    } else {
      setInputFocused(false);
    }
  }, [selectedConfig, config]);

  return (
    // XXX How to tell aria to ignore the click but not the element?
    // eslint-disable-next-line
    <div
      className={classnames("config-input", {
        "config-input--focused": inputFocused,
      })}
      onClick={() => setSelectedConfig(config)}
    >
      <h5>{config.name}</h5>
      <textarea
        defaultValue={defaultValue}
        placeholder={placeholder}
        onFocus={() => setSelectedConfig(config)}
      ></textarea>
    </div>
  );
}
