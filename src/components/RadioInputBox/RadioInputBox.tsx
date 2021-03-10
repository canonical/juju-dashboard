import { useState } from "react";
import classnames from "classnames";
import "./_radio-input-box.scss";

type Props = {
  name: string;
  description: string;
};

export default function RadioInputBox({
  name,
  description,
}: Props): JSX.Element {
  const [opened, setOpened] = useState<boolean>(false);

  const handleSelect = (e: any) => {
    const bool = e.target.value === "on" ? true : false;
    setOpened(bool);
  };
  const labelId = `actionRadio-${name}`;

  return (
    <div className={classnames("radio-input-box", { opened })}>
      <label className="p-radio">
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
      <div className="radio-input-box__content">{description}</div>
    </div>
  );
}
