import type { InputProps, PropsWithSpread } from "@canonical/react-components";
import { Chip, FormikField } from "@canonical/react-components";
import type { FC } from "react";

import type { Version } from "panels/UpgradeModelPanel/types";
import { testId } from "testing/utils";

import { Label, TestId } from "./types";

type Props = PropsWithSpread<
  {
    currentVersion: string;
    name: string;
    version: Version;
  },
  InputProps
>;

const RecommendedVersion: FC<Props> = ({
  currentVersion,
  name,
  version,
  ...props
}) => {
  const date = new Date(version.date);
  return (
    <>
      <div className="recommended-version__radio">
        <span>
          <FormikField
            label={<strong>{version.version}</strong>}
            type="radio"
            name={name}
            {...props}
          />
        </span>
        <span className="recommended-version__radio-details">
          {version.lts ? (
            <span className="recommended-version__radio-column recommended-version__radio-tags">
              <Chip
                isReadOnly
                isInline
                appearance="information"
                value={Label.LTS}
              />
              <Chip
                isReadOnly
                isInline
                appearance="positive"
                value={Label.RECOMMENDED}
              />
            </span>
          ) : null}
          <span className="u-text--muted recommended-version__radio-date recommended-version__radio-column">
            <p className="u-no-margin--bottom">
              {`${date.getDate()} ${date.toLocaleString("default", {
                month: "short",
              })} ${date.getFullYear()}`}
            </p>
          </span>
          <span className="recommended-version__radio-column recommended-version__radio-changelog">
            <p className="u-no-margin--bottom">
              <a
                href={version["link-to-release"]}
                target="_blank"
                rel="noopener noreferrer"
              >
                {Label.CHANGELOG}
              </a>
            </p>
          </span>
        </span>
      </div>
      <p className="p-text--small" {...testId(TestId.UPGRADE_PATH)}>
        Upgrade path: {currentVersion} &rarr;{" "}
        {version["requires-migration"] ? <>Migrate &rarr;</> : null}{" "}
        {version.version}
      </p>
    </>
  );
};

export default RecommendedVersion;
