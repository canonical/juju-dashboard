import { ReactElement, useEffect, useRef, useState } from "react";
import classnames from "classnames";

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
  const inputRef = useRef<HTMLTextAreaElement>(null);

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

  function resetToDefault() {
    if (inputRef?.current) {
      inputRef.current.value = config.default;
    }
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
        defaultValue={defaultValue}
        onFocus={() => setSelectedConfig(config)}
        onChange={(e) => {
          setNewValue(config.name, e.target.value);
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
