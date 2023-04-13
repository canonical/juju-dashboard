import { ClassName, Icon, PropsWithSpread } from "@canonical/react-components";
import classNames from "classnames";
import React, { HTMLProps, MutableRefObject, useRef } from "react";

// TODO: use the react-components component as a base once this PR is released:
// https://github.com/canonical/react-components/pull/887
// Then the only override will be the reset button in an internally controlled input.

export enum Label {
  Clear = "Clear search field",
  Search = "Search",
}

export type Props = PropsWithSpread<
  {
    /**
     * Whether autocomplete should be enabled for the search input.
     */
    autocomplete?: "on" | "off";
    /**
     * Optional classes to pass to the form element.
     */
    className?: ClassName;
    /**
     * Whether the input and buttons should be disabled.
     */
    disabled?: boolean;
    /**
     * Whether the input value will be controlled via external state.
     */
    externallyControlled?: boolean;
    /**
     * A function that will be called when the input value changes.
     */
    onChange?: (inputValue: string) => void;
    /**
     * A function that is called when the user clicks the search icon
     */
    onSearch?: () => void;
    /**
     * A function that is called when the user clicks the reset icon
     */
    onClear?: () => void;
    /**
     * A search input placeholder message.
     */
    placeholder?: string;
    /**
     * Whether the search input should receive focus after pressing the reset button
     */
    shouldRefocusAfterReset?: boolean;
    /**
     * A ref that is passed to the input element.
     */
    ref?: string;
    /**
     * The value of the search input when the state is externally controlled.
     */
    value?: string;
  },
  HTMLProps<HTMLInputElement>
>;

const SearchBox = React.forwardRef<HTMLInputElement, Props>(
  (
    {
      autocomplete = "on",
      className,
      disabled,
      externallyControlled,
      onChange,
      onSearch,
      onClear,
      placeholder = "Search",
      shouldRefocusAfterReset,
      value,
      ...props
    }: Props,
    forwardedRef
  ): JSX.Element => {
    const internalRef = useRef<HTMLInputElement | null>(null);
    const resetInput = () => {
      const inputEl =
        (forwardedRef as MutableRefObject<HTMLInputElement>)?.current ||
        internalRef.current;
      if (inputEl) {
        inputEl.value = "";
        if (shouldRefocusAfterReset) inputEl.focus();
      }
      onChange?.("");
      onClear?.();
    };

    const triggerSearch = () => {
      onSearch && onSearch();
    };

    return (
      <div className={classNames("p-search-box", className)}>
        <label className="u-off-screen" htmlFor="search">
          {placeholder || "Search"}
        </label>
        <input
          autoComplete={autocomplete}
          className="p-search-box__input"
          disabled={disabled}
          id="search"
          name="search"
          onChange={(evt) => onChange?.(evt.target.value)}
          placeholder={placeholder}
          ref={(input) => {
            internalRef.current = input;
            // Handle both function and object refs.
            if (typeof forwardedRef === "function") {
              forwardedRef(input);
            } else if (forwardedRef) {
              forwardedRef.current = input;
            }
          }}
          type="search"
          defaultValue={externallyControlled ? undefined : value}
          value={externallyControlled ? value : undefined}
          {...props}
        />
        <button
          className="p-search-box__reset"
          disabled={disabled}
          onClick={resetInput}
          type="reset"
        >
          <Icon name="close">{Label.Clear}</Icon>
        </button>
        <button
          className="p-search-box__button"
          disabled={disabled}
          onClick={triggerSearch}
        >
          <Icon name="search">{Label.Search}</Icon>
        </button>
      </div>
    );
  }
);

SearchBox.displayName = "SearchBox";

export default SearchBox;
