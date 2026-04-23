import { RadioInput } from "@canonical/react-components";
import { useId, type JSX } from "react";

import { InputMode, type Props } from "./types";

const ContentSwitcher = ({
  showPrimary = true,
  docsLabel,
  docsLink,
  primaryContent,
  secondaryContent,
  onModeChange,
  title,
}: Props): JSX.Element => {
  const id = useId();
  return (
    <>
      <h5 className="u-no-padding--top u-no-margin--bottom">{title}</h5>
      <p className="u-no-margin--bottom p-text--small">
        <a href={docsLink}>{docsLabel}</a>
      </p>
      <div className="u-flex u-flex--gap">
        <div>
          <RadioInput
            checked={showPrimary}
            label={InputMode.LIST}
            name={id}
            onChange={() => {
              onModeChange(true);
            }}
            value={InputMode.LIST}
          />
        </div>
        <div>
          <RadioInput
            checked={!showPrimary}
            label={InputMode.YAML}
            name={id}
            onChange={() => {
              onModeChange(false);
            }}
            value={InputMode.YAML}
          />
        </div>
      </div>
      {showPrimary ? primaryContent : secondaryContent}
    </>
  );
};

export default ContentSwitcher;
