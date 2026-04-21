import { RadioInput } from "@canonical/react-components";
import type { JSX, ReactNode } from "react";

type Props = {
  showPrimary?: boolean;
  docsLabel: string;
  docsLink: string;
  name: string;
  primaryContent: ReactNode;
  secondaryContent: ReactNode;
  onModeChange: (isListMode: boolean) => void;
  title: string;
};

const ContentSwitcher = ({
  showPrimary = true,
  docsLabel,
  docsLink,
  name,
  primaryContent,
  secondaryContent,
  onModeChange,
  title,
}: Props): JSX.Element => {
  return (
    <>
      <h5 className="configs__section-heading u-no-margin--bottom">{title}</h5>
      <a href={docsLink} className="configs__link">
        {docsLabel}
      </a>
      <div className="u-flex u-flex--gap">
        <div>
          <RadioInput
            checked={showPrimary}
            label="List"
            name={name}
            onChange={() => {
              onModeChange(true);
            }}
            value="list"
          />
        </div>
        <div>
          <RadioInput
            checked={!showPrimary}
            label="YAML"
            name={name}
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
