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
      <h5 className="configs__section-heading u-no-margin--bottom">{title}</h5>
      <a href={docsLink} className="p-text--small">
        {docsLabel}
      </a>
      <div className="u-flex u-flex--gap">
        <div>
          <RadioInput
            checked={showPrimary}
            label={InputMode.LIST}
            name={id}
            onChange={() => {
              onModeChange(true);
            }}
            value="list"
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
            value="yaml"
          />
        </div>
      </div>
      {showPrimary ? primaryContent : secondaryContent}
    </>
  );
};

export default ContentSwitcher;
