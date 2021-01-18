import { ReactElement, useEffect, useRef, useState } from "react";
import classnames from "classnames";

import { isSet } from "app/utils";

import type { ConfigProps } from "./ConfigPanel";

export default function BooleanConfig({
  config,
  selectedConfig,
  setSelectedConfig,
  setNewValue,
}: ConfigProps): ReactElement {
  const [inputFocused, setInputFocused] = useState(false);
  const [showUseDefault, setShowUseDefault] = useState(
    config.value !== config.default
  );
  const [localValue, setLocalValue] = useState(config.value);
  const trueRef = useRef<HTMLInputElement>(null);
  const falseRef = useRef<HTMLInputElement>(null);

  let inputValue = config.default;
  if (isSet(localValue) && isSet(config.newValue)) {
    inputValue = localValue;
  } else if (config.default !== config.value) {
    inputValue = config.value;
  }

  useEffect(() => {
    if (selectedConfig?.name === config.name) {
      setInputFocused(true);
    } else {
      setInputFocused(false);
    }
  }, [selectedConfig, config]);

  useEffect(() => {
    if (config.value === config.default) {
      setShowUseDefault(false);
    }
  }, [config]);

  function handleOptionChange(e: any) {
    const bool = e.target.value === "true" ? true : false;
    setNewValue(e.target.name, bool);
    setLocalValue(bool);
    if (bool !== config.default) {
      setShowUseDefault(true);
    } else {
      setShowUseDefault(false);
    }
  }

  function resetToDefault() {
    setNewValue(config.name, config.default);
    setLocalValue(config.default);
    setShowUseDefault(false);
  }

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
      <button
        className={classnames("u-float-right p-button--base", {
          "u-hide": !showUseDefault,
        })}
        onClick={resetToDefault}
      >
        use default
      </button>
      <div className="row">
        <label className=".p-radio--inline col-2">
          <input
            type="radio"
            className="p-radio__input"
            name={config.name}
            aria-labelledby={config.name}
            checked={inputValue === true}
            value="true"
            onClick={handleOptionChange}
            onChange={handleOptionChange}
            ref={trueRef}
          />
          <span className="p-radio__label">true</span>
        </label>
        <label className="p-radio--inline col-2">
          <input
            type="radio"
            className="p-radio__input"
            name={config.name}
            aria-labelledby={config.name}
            checked={inputValue === false}
            value="false"
            onClick={handleOptionChange}
            onChange={handleOptionChange}
            ref={falseRef}
          />
          <span className="p-radio__label">false</span>
        </label>
      </div>
    </div>
  );
}
