import { FadeInDown } from "@canonical/react-components/dist/components/MultiSelect/FadeInDown";
import type { FC } from "react";
import React from "react";

type AutocompleteInputItem = {
  label: string;
  value: number | string;
};

type Props = {
  isOpen: boolean;
  options: AutocompleteInputItem[];
  onSelectItem: (item: string) => void;
} & React.HTMLAttributes<HTMLDivElement>;

const AutocompleteInputDropdown: FC<Props> = ({
  options,
  onSelectItem,
  isOpen,
  ...props
}) => {
  const onMouseUp = (event: React.MouseEvent<HTMLLIElement>): void => {
    // Prevent clicks from propagating so that if the autocomplete is inside a panel or modal it's
    // not registered as a cloud outside (as the dropdown is inside a portal).
    event.stopPropagation();
    const value = (event.target as HTMLLIElement)?.dataset.value;
    if (value) {
      onSelectItem(value);
    }
  };

  return (
    <FadeInDown isVisible={isOpen}>
      <div role="listbox" {...props}>
        <ul className="autocomplete-input__dropdown-list">
          {options.map((item) => (
            <li
              key={item.value}
              className="autocomplete-input__dropdown-item"
              data-value={item.value}
              onMouseUp={onMouseUp}
              role="option"
            >
              {item.label}
            </li>
          ))}
        </ul>
      </div>
    </FadeInDown>
  );
};

export default AutocompleteInputDropdown;
