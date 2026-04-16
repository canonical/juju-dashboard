import type { InputProps, PropsWithSpread } from "@canonical/react-components";
import { Chip, FormikField } from "@canonical/react-components";
import type { FC } from "react";

import type { VersionElem } from "juju/jimm/JIMMV4";
import {
  getModelUUIDFromList,
  getModelDataByUUID,
  getControllerByUUID,
} from "store/juju/selectors";
import { getControllerVersion } from "store/juju/utils/controllers";
import { isLTS, requiresMigration } from "store/juju/utils/upgrades";
import { useAppSelector } from "store/store";
import { testId } from "testing/utils";

import { Label, TestId } from "./types";

type Props = PropsWithSpread<
  {
    modelName: null | string;
    name: string;
    qualifier: null | string;
    version: VersionElem;
  },
  InputProps
>;

const RecommendedVersion: FC<Props> = ({
  modelName,
  name,
  qualifier,
  version,
  ...props
}) => {
  const modelUUID = useAppSelector((state) =>
    getModelUUIDFromList(state, modelName, qualifier),
  );
  const model = useAppSelector((state) => getModelDataByUUID(state, modelUUID));
  const controller = useAppSelector((state) =>
    getControllerByUUID(state, model?.info?.["controller-uuid"]),
  );
  const controllerVersion = controller
    ? getControllerVersion(controller)
    : null;
  const currentVersion = model?.model.version;
  const needsMigration =
    controllerVersion && requiresMigration(controllerVersion, version.version);
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
          {isLTS(version.version) ? (
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
        {needsMigration ? <>Migrate &rarr;</> : null} {version.version}
      </p>
    </>
  );
};

export default RecommendedVersion;
