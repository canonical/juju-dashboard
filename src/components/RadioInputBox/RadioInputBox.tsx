import { useState } from "react";

import type { ActionOptions } from "panels/ActionsPanel/ActionsPanel";

import "./_radio-input-box.scss";

type Props = {
  name: string;
  description: string;
  options: ActionOptions;
};

export default function RadioInputBox({
  name,
  description,
  options,
}: Props): JSX.Element {
  const [opened, setOpened] = useState<boolean>(false);

  const handleSelect = (e: any) => {
    const bool = e.target.value === "on" ? true : false;
    setOpened(bool);
  };
  const labelId = `actionRadio-${name}`;

  const generateOptions = (options: ActionOptions): JSX.Element[] => {
    return options.map((option) => <input key={option.name} type="text" />);
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
