import { ReactElement, useEffect, useRef, useState } from "react";
import classnames from "classnames";

import { isSet } from "app/utils";

import type { ConfigProps } from "./ConfigPanel";

export default function TextAreaConfig({
  config,
  selectedConfig,
  setSelectedConfig,
  setNewValue,
}: ConfigProps): ReactElement {
  const [inputFocused, setInputFocused] = useState(false);
  const [showUseDefault, setShowUseDefault] = useState(
    config.value !== config.default
  );
  const [localNewValue, setLocalNewValue] = useState("");
  const inputRef = useRef<HTMLTextAreaElement>(null);

  let inputValue = config.default;
  if (isSet(localNewValue) && isSet(config.newValue)) {
    inputValue = localNewValue;
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

  function resetToDefault() {
    setLocalNewValue(config.default);
    setNewValue(config.name, config.default);
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
      <textarea
        ref={inputRef}
        value={inputValue}
        onFocus={() => setSelectedConfig(config)}
        onChange={(e) => {
          setNewValue(config.name, e.target.value);
          setLocalNewValue(e.target.value);
          if (e.target.value !== config.default) {
            setShowUseDefault(true);
          } else {
            setShowUseDefault(false);
          }
        }}
      ></textarea>
    </div>
  );
}
