import { ReactElement, useEffect, useState } from "react";
import classnames from "classnames";

import type { ConfigProps } from "./ConfigPanel";

export default function BooleanConfig({
  config,
  selectedConfig,
  setSelectedConfig,
}: ConfigProps): ReactElement {
  const [inputFocused, setInputFocused] = useState(false);

  useEffect(() => {
    if (selectedConfig?.name === config.name) {
      setInputFocused(true);
    } else {
      setInputFocused(false);
    }
  }, [selectedConfig, config]);

  const inputName = `${config.name}-booleanSelect`;

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
      <div className="row">
        <label className=".p-radio--inline col-1">
          <input
            type="radio"
            className="p-radio__input"
            name={inputName}
            aria-labelledby={inputName}
            defaultChecked={config.value === true}
          />
          <span className="p-radio__label" id={inputName}>
            true
          </span>
        </label>
        <label className="p-radio--inline col-1">
          <input
            type="radio"
            className="p-radio__input"
            name={inputName}
            aria-labelledby={inputName}
            defaultChecked={config.value === false}
          />
          <span className="p-radio__label" id={inputName}>
            false
          </span>
        </label>
      </div>
    </div>
  );
}
