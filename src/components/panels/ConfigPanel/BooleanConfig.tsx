import { ReactElement, useEffect, useRef, useState } from "react";
import classnames from "classnames";

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
  const trueRef = useRef<HTMLInputElement>(null);
  const falseRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (selectedConfig?.name === config.name) {
      setInputFocused(true);
    } else {
      setInputFocused(false);
    }
  }, [selectedConfig, config]);

  function handleOptionChange(e: any) {
    setNewValue(e.target.name, e.target.value === "true" ? true : false);
    const bool = e.target.value === "true" ? true : false;
    if (bool !== config.default) {
      setShowUseDefault(true);
    } else {
      setShowUseDefault(false);
    }
  }

  function resetToDefault() {
    if (config.default) {
      if (trueRef?.current) {
        trueRef.current.checked = true;
      }
    } else {
      if (falseRef?.current) {
        falseRef.current.checked = true;
      }
    }
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
            defaultChecked={config.value === true}
            value="true"
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
            defaultChecked={config.value === false}
            value="false"
            onChange={handleOptionChange}
            ref={falseRef}
          />
          <span className="p-radio__label">false</span>
        </label>
      </div>
    </div>
  );
}
