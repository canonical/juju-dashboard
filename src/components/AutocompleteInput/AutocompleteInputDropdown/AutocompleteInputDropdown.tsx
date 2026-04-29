import { FadeInDown } from "@canonical/react-components/dist/components/MultiSelect/FadeInDown";
import classNames from "classnames";
import type { FC } from "react";
import React, { useLayoutEffect } from "react";

type AutocompleteInputItem = {
  label: string;
  value: string;
};

type Props = {
  highlightedOptionIndex: null | number;
  isOpen: boolean;
  onSelectItem: (item: string) => void;
  options: AutocompleteInputItem[];
  id: string;
  setHighlightedOptionIndex: React.Dispatch<
    React.SetStateAction<null | number>
  >;
} & React.HTMLAttributes<HTMLDivElement>;

/**
 * Get a unique id for the option at a specific position.
 */
const getOptionId = (optionsId: string, index: number): string =>
  `${optionsId}-option-${index}`;

/**
 * Scroll to the option if there are more items than fit on the screen.
 */
const scrollToOption = (id: string, highlightedOptionIndex: number): void => {
  document
    .getElementById(getOptionId(id, highlightedOptionIndex))
    ?.scrollIntoView({
      block: "nearest",
    });
};

const AutocompleteInputDropdown: FC<Props> = ({
  options,
  onSelectItem,
  id,
  highlightedOptionIndex,
  isOpen,
  setHighlightedOptionIndex,
  ...props
}) => {
  // Wait for any rerenders and then scroll to items that are outside the visible scroll area.
  useLayoutEffect(() => {
    if (highlightedOptionIndex !== null) {
      // The event needs to happen after repaint in case the DOM changed.
      window.requestAnimationFrame(
        scrollToOption.bind(this, id, highlightedOptionIndex),
      );
    }
  }, [highlightedOptionIndex, id]);

  return (
    <FadeInDown isVisible={isOpen}>
      <div
        {...props}
        role="listbox"
        aria-activedescendant={
          highlightedOptionIndex !== null
            ? getOptionId(id, highlightedOptionIndex)
            : undefined
        }
      >
        <ul className="autocomplete-input__dropdown-list">
          {options.map((item, index) => {
            const selected = index === highlightedOptionIndex;
            return (
              <li
                key={item.value}
                id={getOptionId(id, index)}
                aria-selected={selected}
                className={classNames(
                  "autocomplete-input__dropdown-item p-contextual-menu__link",
                  {
                    highlight: selected,
                  },
                )}
                onMouseMove={() => {
                  // Select the item that is being hovered so that the mouse and keyboard events are in sync.
                  setHighlightedOptionIndex(index);
                }}
                onMouseUp={(event) => {
                  // Prevent clicks from propagating so that if the autocomplete is inside a panel or modal it's
                  // not registered as a cloud outside (as the dropdown is inside a portal).
                  event.stopPropagation();
                  onSelectItem(item.value);
                }}
                role="option"
              >
                {item.label}
              </li>
            );
          })}
        </ul>
      </div>
    </FadeInDown>
  );
};

export default AutocompleteInputDropdown;
