import { ReactElement, useEffect, useState } from "react";
import classnames from "classnames";

import type { ConfigProps } from "./ConfigPanel";

export default function TextAreaConfig({
  config,
  selectedConfig,
  setSelectedConfig,
  setNewValue,
}: ConfigProps): ReactElement {
  const [inputFocused, setInputFocused] = useState(false);

  let defaultValue = config.default;
  if (config.default !== config.value) {
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
      <h5 className="u-float-left">{config.name}</h5>
      <span className="u-float-right">use default</span>
      <textarea
        defaultValue={defaultValue}
        onFocus={() => setSelectedConfig(config)}
        onChange={(e) => setNewValue(config.name, e.target.value)}
      ></textarea>
    </div>
  );
}
