import { useEffect, useRef, type HTMLProps, type JSX } from "react";

/**
 * An inline checkbox which does not have a label associated with it. Do not use unless you know
 * you should.
 *
 * Based on the Vanilla checkbox, but removes the padding adjacent to the label.
 *
 * @link https://vanillaframework.io/docs/base/forms#checkbox
 */
export default function InlineCheckbox<L extends string>({
  indeterminate,
  label,
  ...props
}: {
  /**
   * If `true`, the checkbox will present an indeterminate state.
   */
  indeterminate?: boolean;
  /**
   * Aria label to announce the checkbox. This must be included for accessibility, and cannot be
   * an empty string.
   */
  label: L extends "" ? never : L;
} & HTMLProps<HTMLInputElement>): JSX.Element {
  const input = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (input.current === null || indeterminate === undefined) {
      return;
    }
    input.current.indeterminate = indeterminate;
  }, [indeterminate]);

  return (
    <label className="p-checkbox">
      <input
        {...props}
        ref={input}
        type="checkbox"
        className="p-checkbox__input"
        aria-label={label}
      />
      <span className="p-checkbox__label" style={{ paddingLeft: 0 }}></span>
    </label>
  );
}
