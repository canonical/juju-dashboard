import type { JSX, ReactNode } from "react";
import { useEffect, useRef, useState } from "react";

type Props = {
  name: string;
  description: string;
  selectedInput?: string | null;
  onSelect: (inputName: string) => void;
  children: ReactNode;
};

export default function RadioInputBox({
  name,
  children,
  description,
  selectedInput = null,
  onSelect,
}: Props): JSX.Element {
  const [opened, setOpened] = useState<boolean>(false);
  const inputBoxRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Used to track whether this radio box has been opened before. See its usage for more
  // information.
  const hasBeenOpened = useRef(false);

  useEffect(() => {
    setOpened(selectedInput === name);
  }, [selectedInput, name]);

  // Control the open/close animation based on `opened`. This hook will trigger an animation
  // between the collapsed and maximum height. Since it's not possible to transition to/from
  // `initial` height (where the height is set by the content), we have to capture the content's
  // height and manually set it from JS.
  //
  // The 'base' height is controlled in CSS via the `:not([aria-expanded="true"])` selector,
  // enforcing the collapsed height without any JS (prevents the flash). This also means that once
  // the animation is complete (and therefore no longer enforcing the height), the CSS will still
  // be controlling the actual element height.
  useEffect(() => {
    const wrapper = inputBoxRef.current;
    const container = containerRef.current;

    if (wrapper === null || container === null) return;

    if (!hasBeenOpened.current) {
      // If this radio box hasn't been opened, and isn't about to be opened, then don't bother
      // animating anything. This ensures that the close animation doesn't play when the first
      // component is first mounted.
      if (!opened) {
        return;
      }

      // An open attempt has been made, indicate that this has happened.
      hasBeenOpened.current = true;
    }

    // Default animation points start collapsed, and expand to content height.
    const points = [
      // Collapsed height.
      "var(--initial-height)",
      // Maximum content height (inner content + vertical spacing).
      `calc(${container.offsetHeight}px + var(--v-spacing))`,
    ];
    if (!opened) {
      points.reverse();
    }

    wrapper.animate(
      {
        height: points,
      },
      {
        // Corresponds with the 'fast' animation duration in Vanilla:
        // https://vanillaframework.io/docs/settings/animation-settings#duration
        duration: 165,
        easing: "ease-out",
      },
    );
  }, [opened]);

  const handleSelect = () => {
    onSelect(name);
    setOpened(true);
  };

  const labelId = `inputRadio-${name}`;

  return (
    <div className="radio-input-box" aria-expanded={opened} ref={inputBoxRef}>
      <div className="radio-input-box__container" ref={containerRef}>
        <label className="p-radio radio-input-box__label">
          <input
            type="radio"
            className="p-radio__input"
            name="inputRadioSelector"
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
          <div className="radio-input-box__options">{children}</div>
        </div>
      </div>
    </div>
  );
}
