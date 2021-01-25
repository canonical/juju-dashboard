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
  const [inputChanged, setInputChanged] = useState(false);
  const [showDescription, setShowDescription] = useState(false);
  const [showUseDefault, setShowUseDefault] = useState(
    config.value !== config.default
  );
  const trueRef = useRef<HTMLInputElement>(null);
  const falseRef = useRef<HTMLInputElement>(null);
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
          (descriptionRef.current.firstChild as HTMLDivElement).clientHeight
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
    if (selectedConfig?.name === config.name) {
      setInputFocused(true);
    } else {
      setInputFocused(false);
    }
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

  function handleOptionChange(e: any) {
    const bool = e.target.value === "true" ? true : false;
    setNewValue(e.target.name, bool);
  }

  function resetToDefault() {
    setNewValue(config.name, config.default);
  }

  return (
    // XXX How to tell aria to ignore the click but not the element?
    // eslint-disable-next-line
    <div
      className={classnames("config-input", {
        "config-input--focused": inputFocused,
        "config-input--changed": inputChanged,
      })}
      onClick={() => setSelectedConfig(config)}
    >
      <h5
        className="u-float-left"
        onClick={() => setShowDescription(!showDescription)}
        onKeyPress={() => setShowDescription(!showDescription)}
        // eslint-disable-next-line
        role="button"
        tabIndex={0}
      >
        <i
          className={classnames("config-input--view-description", {
            "p-icon--plus": !showDescription,
            "p-icon--minus": showDescription,
          })}
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
        className={classnames("config-input--description", {
          "config-input--description__show": showDescription,
        })}
        ref={descriptionRef}
      >
        <div className="config-input--description-container">
          {config.description}
        </div>
      </div>
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
