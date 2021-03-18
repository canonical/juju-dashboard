import { useEffect, useState } from "react";
import classnames from "classnames";

import type {
  ActionOptions,
  SetSelectedAction,
} from "panels/ActionsPanel/ActionsPanel";

import "./_radio-input-box.scss";

type Props = {
  name: string;
  description: string;
  options: ActionOptions;
  selectedAction: string | undefined;
  onSelect: SetSelectedAction;
};

export default function RadioInputBox({
  name,
  description,
  options,
  selectedAction,
  onSelect,
}: Props): JSX.Element {
  const [opened, setOpened] = useState<boolean>(false);

  useEffect(() => {
    setOpened(selectedAction === name);
  }, [selectedAction, name]);

  const handleSelect = () => {
    onSelect(name);
  };
  const labelId = `actionRadio-${name}`;

  const generateOptions = (options: ActionOptions): JSX.Element => {
    return (
      <form>
        {options.map((option) => {
          const inputKey = `${option.name}Input`;
          return (
            <>
              <label
                className={classnames({
                  "radio-input-box__label--required": option.required,
                })}
                htmlFor={inputKey}
              >
                {option.name}
              </label>
              <input
                className="radio-input-box__input"
                type="text"
                id={inputKey}
                name={inputKey}
              ></input>
              <span>{option.description}</span>
            </>
          );
        })}
      </form>
    );
  };

  return (
    <div className="radio-input-box" aria-expanded={opened}>
      <label className="p-radio radio-input-box__label">
        <input
          type="radio"
          className="p-radio__input"
          name="actionRadioSelector"
          aria-labelledby={labelId}
          onClick={handleSelect}
          onChange={handleSelect}
        />
        <span className="p-radio__label" id={labelId}>
          {name}
        </span>
      </label>
      <div className="radio-input-box__content">
        <div className="radio-input-box__description">{description}</div>
        <div className="radio-input-box__options">
          {generateOptions(options)}
        </div>
      </div>
    </div>
  );
}
