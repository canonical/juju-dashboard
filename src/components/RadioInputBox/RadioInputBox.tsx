import { useEffect, useRef, useState, useMemo } from "react";
import { Formik } from "formik";

import type {
  ActionData,
  ActionOptions,
  ActionOptionValue,
  SetSelectedAction,
} from "panels/ActionsPanel/ActionsPanel";

import ActionOptionInputs from "./ActionOptionInputs";

import "./_radio-input-box.scss";

type Props = {
  name: string;
  data: ActionData;
  description: string;
  selectedAction: string | undefined;
  onSelect: SetSelectedAction;
  onValuesChange: (actionName: string, values: ActionOptionValue) => void;
};

export default function RadioInputBox({
  name,
  data,
  description,
  selectedAction,
  onSelect,
  onValuesChange,
}: Props): JSX.Element {
  const [opened, setOpened] = useState<boolean>(false);
  const inputBoxRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // 20, 40 are magic numbers that align nicely with the heights.
  const initialHeight = 40;
  const paddingNumber = 20;

  useEffect(() => {
    if (inputBoxRef.current !== null) {
      // Due to the 'closed' hook animation running on initial load we cannot
      // set the initial height in the css but have to do it on the first load.
      inputBoxRef.current.style.height = initialHeight + "px";
    }
  }, [inputBoxRef]);

  useEffect(() => {
    setOpened(selectedAction === name);
  }, [selectedAction, name]);

  useEffect(() => {
    const wrapper = inputBoxRef.current;
    const container = containerRef.current;

    if (wrapper === null || container === null) return;

    let startHeight = 0;
    let endHeight = 0;
    let duration = 0;

    if (opened) {
      startHeight = wrapper.offsetHeight;
      // To be used when we're closing so we know what the original value was.
      endHeight = container.offsetHeight + paddingNumber;
      duration = endHeight;
      // Set the height of the wrapper element to the end height to
      // override the height set in css for the collapsed size.
      wrapper.style.height = endHeight + "px";
    } else if (wrapper.offsetHeight !== initialHeight) {
      // Do not animate if the wrapper height is already in the closed state
      // and this hook runs for the closed state again.
      endHeight = initialHeight;
      startHeight = container.offsetHeight + paddingNumber;
      duration = startHeight;
    }
    const animation = wrapper.animate(
      {
        height: [startHeight + "px", endHeight + "px"],
      },
      {
        // Set the duration to be the number of pixels that it has to animate
        // so that it's a consistent animation regardless of the height.
        duration,
        easing: "ease-out",
      }
    );

    animation.onfinish = () => {
      if (opened === false) {
        wrapper.style.height = initialHeight + "px";
      } else {
        wrapper.style.height = "";
      }
    };
  }, [opened, initialHeight]);

  const handleSelect = () => {
    onSelect(name);
  };

  const action = data[name];

  const collectedOptions = useMemo(() => {
    const collectOptions: ActionOptions = [];
    Object.keys(action.params.properties).forEach((name) => {
      const property = action.params.properties[name];
      collectOptions.push({
        name: name,
        description: property.description,
        type: property.type,
        required: action.params.required.includes(name),
      });
    });
    return collectOptions;
  }, [action.params.properties, action.params.required]);

  const initialValues = useMemo(() => {
    const initialValues: { [key: string]: string } = {};
    collectedOptions.forEach((option) => {
      initialValues[`${name}-${option.name}`] = "";
    });
    return initialValues;
  }, [name, collectedOptions]);

  const labelId = `actionRadio-${name}`;

  return (
    <div className="radio-input-box" aria-expanded={opened} ref={inputBoxRef}>
      <div className="radio-input-box__container" ref={containerRef}>
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
            <Formik
              initialValues={initialValues}
              onSubmit={() => {}}
              key={name}
            >
              <ActionOptionInputs
                actionName={name}
                options={collectedOptions}
                onValuesChange={onValuesChange}
              />
            </Formik>
          </div>
        </div>
      </div>
    </div>
  );
}
