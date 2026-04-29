import type { InputProps, PropsWithSpread } from "@canonical/react-components";
import { ContextualMenu, Input } from "@canonical/react-components";
import type { FC, HTMLProps } from "react";
import { useCallback, useId, useMemo, useState } from "react";

import AutocompleteInputDropdown from "./AutocompleteInputDropdown";

type AutocompleteInputItem = {
  label: string;
  value: string;
};

type Props = PropsWithSpread<
  {
    autocompleteStyle?: HTMLProps<HTMLSpanElement>["style"];
    options: AutocompleteInputItem[];
    onValueChanged?: (value: string) => void;
  },
  InputProps
>;

const getNextOptionIndex = (
  options: Props["options"],
  goingUp: boolean,
  prevIndex: null | number,
): number => {
  if (prevIndex === null) {
    return goingUp ? options.length - 1 : 0;
  }
  const increment = goingUp ? -1 : 1;
  const nextIndex = prevIndex + increment;

  if (increment > 0) {
    return nextIndex < options.length ? nextIndex : prevIndex;
  }

  return nextIndex >= 0 ? nextIndex : prevIndex;
};

const updateDropdown = (
  setIsDropdownOpen: (isDropdownOpen: boolean) => void,
  filteredOptions: Props["options"],
  setHighlightedOptionIndex: React.Dispatch<
    React.SetStateAction<null | number>
  >,
  visible: boolean,
): void => {
  // Only show the dropdown if there are options.
  setIsDropdownOpen(visible && !!filteredOptions.length);
  // Clear the selected item when it closes.
  if (!visible) {
    setHighlightedOptionIndex(null);
  }
};

const handleKeyDown = (
  isDropdownOpen: boolean,
  setIsDropdownOpen: (isDropdownOpen: boolean) => void,
  filteredOptions: Props["options"],
  setHighlightedOptionIndex: React.Dispatch<
    React.SetStateAction<null | number>
  >,
  highlightedOptionIndex: null | number,
  onSelectItem: (item: string) => void,
  event: React.KeyboardEvent<HTMLInputElement>,
): void => {
  const isTab = event.key === "Tab";
  const isUp = event.key === "ArrowUp";
  const isDown = event.key === "ArrowDown";
  const isUpDown = isUp || isDown;
  const isEnter = event.key === "Enter";
  if (isUpDown) {
    // Don't move the cursor in the input.
    event.preventDefault();

    // Pressing an up/down key should open the menu.
    if (!isDropdownOpen) {
      updateDropdown(
        setIsDropdownOpen,
        filteredOptions,
        setHighlightedOptionIndex,
        true,
      );
    }
  }
  if ((isEnter || isTab) && isDropdownOpen) {
    // When the menu is open then pressing enter or tab should not do the default actions (submitting a form, moving focus etc.)
    event.preventDefault();
  }
  if (
    isEnter &&
    highlightedOptionIndex !== null &&
    filteredOptions[highlightedOptionIndex]
  ) {
    // Select the highlighted item in the menu.
    onSelectItem(filteredOptions[highlightedOptionIndex].value);
  }
  // Pressing up/down or tab/shift+tab should move the selected item up/down.
  if (isUpDown || isTab) {
    setHighlightedOptionIndex((prevIndex) => {
      const goingUp = isUp || (isTab && event.shiftKey);
      return getNextOptionIndex(filteredOptions, goingUp, prevIndex);
    });
  }
  // If escape is pressed and the dropdown is open then close it, otherwise let the key behave as normal.
  if (isDropdownOpen && event.key === "Escape") {
    event.stopPropagation();
    updateDropdown(
      setIsDropdownOpen,
      filteredOptions,
      setHighlightedOptionIndex,
      false,
    );
  }
};

const AutocompleteInput: FC<Props> = ({
  autocompleteStyle,
  options,
  onValueChanged,
  ...props
}) => {
  const [highlightedOptionIndex, setHighlightedOptionIndex] = useState<
    null | number
  >(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [inputValue, setInputValue] = useState<string>(
    props.value?.toString() ?? "",
  );
  const dropdownId = useId();
  const inputId = useId();

  const filteredOptions = useMemo(() => {
    // Only display options that contain the text
    const filtered = options.filter((item) => {
      const inputText = inputValue.trim().toLowerCase();
      return (
        item.label.trim().toLowerCase().includes(inputText) ||
        item.value.toString().trim().toLowerCase().includes(inputText)
      );
    });
    // If there are no options to display then close the dropdown.
    if (!filtered.length) {
      updateDropdown(
        setIsDropdownOpen,
        filtered,
        setHighlightedOptionIndex,
        false,
      );
    }
    return filtered;
  }, [inputValue, options]);

  const onSelectItem = useCallback(
    (value: string) => {
      onValueChanged?.(value);
      setInputValue(value);
      updateDropdown(
        setIsDropdownOpen,
        filteredOptions,
        setHighlightedOptionIndex,
        false,
      );
    },
    [filteredOptions, onValueChanged],
  );

  return (
    <ContextualMenu
      style={autocompleteStyle}
      className="autocomplete-input"
      onToggleMenu={(isOpen) => {
        // Handle syncing the state when toggling the menu from within the
        // contextual menu component e.g. when clicking outside.
        if (isOpen !== isDropdownOpen) {
          updateDropdown(
            setIsDropdownOpen,
            filteredOptions,
            setHighlightedOptionIndex,
            isOpen,
          );
        }
      }}
      position="left"
      positionNode={document.getElementById(inputId)}
      constrainPanelWidth
      scrollOverflow
      toggle={
        <Input
          {...props}
          aria-controls={dropdownId}
          aria-expanded={isDropdownOpen}
          id={inputId}
          aria-autocomplete="list"
          autoComplete="off"
          onChange={(event) => {
            const { value } = event.target;
            setInputValue(value);
            // Reopen if dropdown has been closed via ESC.
            updateDropdown(
              setIsDropdownOpen,
              filteredOptions,
              setHighlightedOptionIndex,
              true,
            );
            onValueChanged?.(value);
            // Call any parent onChange handlers.
            props.onChange?.(event);
          }}
          onFocus={(event) => {
            updateDropdown(
              setIsDropdownOpen,
              filteredOptions,
              setHighlightedOptionIndex,
              true,
            );
            // Call any parent onFocus handlers.
            props.onFocus?.(event);
          }}
          onKeyDown={(event) => {
            handleKeyDown(
              isDropdownOpen,
              setIsDropdownOpen,
              filteredOptions,
              setHighlightedOptionIndex,
              highlightedOptionIndex,
              onSelectItem,
              event,
            );
          }}
          type="text"
          value={inputValue}
        />
      }
      visible={isDropdownOpen}
    >
      <AutocompleteInputDropdown
        highlightedOptionIndex={highlightedOptionIndex}
        id={dropdownId}
        isOpen={isDropdownOpen}
        options={filteredOptions}
        onSelectItem={onSelectItem}
        setHighlightedOptionIndex={setHighlightedOptionIndex}
      />
    </ContextualMenu>
  );
};

export default AutocompleteInput;
