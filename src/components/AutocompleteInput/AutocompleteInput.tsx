import type { InputProps, PropsWithSpread } from "@canonical/react-components";
import { ContextualMenu, Input } from "@canonical/react-components";
import type { FC } from "react";
import { useId, useMemo, useState } from "react";

import AutocompleteInputDropdown from "./AutocompleteInputDropdown";

type AutocompleteInputItem = {
  label: string;
  value: number | string;
};

type Props = PropsWithSpread<
  {
    options: AutocompleteInputItem[];
    onValueChanged?: (value: string) => void;
  },
  InputProps
>;

const AutocompleteInput: FC<Props> = ({
  options,
  onValueChanged,
  ...props
}) => {
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
      setIsDropdownOpen(false);
    }
    return filtered;
  }, [inputValue, options]);

  const updateDropdown = (visible: boolean): void => {
    // Only show the dropdown if there are options.
    setIsDropdownOpen(visible && !!filteredOptions.length);
  };

  return (
    <ContextualMenu
      className="autocomplete-input"
      onToggleMenu={(isOpen) => {
        // Handle syncing the state when toggling the menu from within the
        // contextual menu component e.g. when clicking outside.
        if (isOpen !== isDropdownOpen) {
          updateDropdown(isOpen);
        }
      }}
      position="left"
      positionNode={document.getElementById(inputId)}
      constrainPanelWidth
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
            updateDropdown(true);
            onValueChanged?.(value);
            // Call any parent onChange handlers.
            props.onChange?.(event);
          }}
          onFocus={(event) => {
            updateDropdown(true);
            // Call any parent onFocus handlers.
            props.onFocus?.(event);
          }}
          type="text"
          value={inputValue}
        />
      }
      visible={isDropdownOpen}
    >
      <AutocompleteInputDropdown
        id={dropdownId}
        isOpen={isDropdownOpen}
        options={filteredOptions}
        onSelectItem={(value) => {
          onValueChanged?.(value);
          setInputValue(value);
          setIsDropdownOpen(false);
        }}
      />
    </ContextualMenu>
  );
};

export default AutocompleteInput;
