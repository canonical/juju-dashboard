import { useEffect, useRef, useState } from "react";
import classnames from "classnames";

import { isSet } from "app/utils/utils";

import type { ConfigProps } from "./ConfigPanel";

export default function TextAreaConfig({
  config,
  selectedConfig,
  setSelectedConfig,
  setNewValue,
}: ConfigProps): JSX.Element {
  const [inputFocused, setInputFocused] = useState(false);
  const [inputChanged, setInputChanged] = useState(false);
  const [showUseDefault, setShowUseDefault] = useState(
    config.value !== config.default
  );
  const [showDescription, setShowDescription] = useState(false);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const descriptionRef = useRef<HTMLDivElement>(null);
  const [maxDescriptionHeight, setMaxDescriptionHeight] = useState("0px");

  let inputValue = config.default;
  if (isSet(config.newValue)) {
    inputValue = config.newValue;
  } else if (config.default !== config.value) {
    inputValue = config.value;
  }

  useEffect(() => {
    if (descriptionRef.current?.firstChild) {
      setMaxDescriptionHeight(
        `${
          (descriptionRef.current.firstChild as HTMLPreElement).clientHeight
        }px`
      );
    }
  }, []);

  useEffect(() => {
    if (!descriptionRef.current) {
      return;
    }
    if (showDescription) {
      descriptionRef.current.style.maxHeight = maxDescriptionHeight;
    } else {
      descriptionRef.current.style.maxHeight = "0px";
    }
  }, [showDescription, maxDescriptionHeight]);

  useEffect(() => {
    setInputFocused(selectedConfig?.name === config.name);
  }, [selectedConfig, config]);

  useEffect(() => {
    if (
      (isSet(config.newValue) && config.newValue !== config.default) ||
      (!isSet(config.newValue) && config.value !== config.default)
    ) {
      setShowUseDefault(true);
    } else {
      setShowUseDefault(false);
    }

    if (isSet(config.newValue) && config.newValue !== config.value) {
      setInputChanged(true);
    } else {
      setInputChanged(false);
    }
  }, [config]);

  function resetToDefault() {
    setNewValue(config.name, config.default);
  }

  function handleShowDescription() {
    setShowDescription(!showDescription);
  }

  return (
    // XXX How to tell aria to ignore the click but not the element?
    // eslint-disable-next-line
    <div
      className={classnames("config-input", {
        "config-input--focused": inputFocused,
        "config-input--changed": inputChanged,
      })}
      data-testid={config.name}
      onClick={() => setSelectedConfig(config)}
    >
      <h5 className="u-float-left">
        <i
          className={classnames("config-input--view-description", {
            "p-icon--plus": !showDescription,
            "p-icon--minus": showDescription,
          })}
          onClick={handleShowDescription}
          onKeyPress={handleShowDescription}
          role="button"
          tabIndex={0}
        />
        {config.name}
      </h5>
      <button
        className={classnames(
          "u-float-right p-button--base config-panel__hide-button",
          {
            "config-panel__show-button": showUseDefault,
          }
        )}
        onClick={resetToDefault}
      >
        use default
      </button>
      <div
        className={classnames("config-input--description")}
        ref={descriptionRef}
      >
        <pre className="config-input--description-container">
          {config.description}
        </pre>
      </div>
      <textarea
        ref={inputRef}
        value={inputValue}
        onFocus={() => setSelectedConfig(config)}
        onChange={(e) => {
          setNewValue(config.name, e.target.value);
        }}
      ></textarea>
    </div>
  );
}
