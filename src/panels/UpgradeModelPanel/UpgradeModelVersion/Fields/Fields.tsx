import { FormikField } from "@canonical/react-components";
import { useFormikContext } from "formik";
import type { FC } from "react";

import AutocompleteField from "components/AutocompleteField";
import NestedFields from "components/NestedFields";
import type { VersionElem } from "juju/jimm/JIMMV4";
import {
  getModelUpgradeVersions,
  getModelUUIDFromList,
  getRecommendedVersions,
} from "store/juju/selectors";
import { useAppSelector } from "store/store";
import { testId } from "testing/utils";
import isHigherSemver from "utils/isHigherSemver";

import RecommendedVersion from "../RecommendedVersion";
import type { FormFields } from "../types";
import { FieldName, UpgradeType } from "../types";

import { Label, TestId } from "./types";

type Props = {
  modelName: null | string;
  qualifier: null | string;
};

// Sort by semver so that the highest version comes first.
const sortReverse = (versionA: VersionElem, versionB: VersionElem): number => {
  if (versionA.version === versionB.version) {
    return 0;
  }
  return isHigherSemver(versionA.version, versionB.version) ? -1 : 1;
};

const Fields: FC<Props> = ({ modelName, qualifier }) => {
  const modelUUID = useAppSelector((state) =>
    getModelUUIDFromList(state, modelName, qualifier),
  );
  const availableVersions = useAppSelector((state) =>
    getModelUpgradeVersions(state, modelUUID),
  );
  const recommendedVersions = useAppSelector((state) =>
    getRecommendedVersions(state, modelUUID),
  );
  const { values } = useFormikContext<FormFields>();

  return (
    <>
      <FormikField
        label={Label.RECOMMENDED}
        name={FieldName.UPGRADE_TYPE}
        type="radio"
        value={UpgradeType.RECOMMENDED}
      />
      {values.upgradeType === UpgradeType.RECOMMENDED ? (
        <NestedFields {...testId(TestId.RECOMMENDED)}>
          {recommendedVersions.map((version) => (
            <RecommendedVersion
              key={version.version}
              modelName={modelName}
              name={FieldName.RECOMMENDED_VERSION}
              qualifier={qualifier}
              value={version.version}
              version={version}
            />
          ))}
        </NestedFields>
      ) : null}
      <FormikField
        label={Label.MANUAL}
        name={FieldName.UPGRADE_TYPE}
        type="radio"
        value={UpgradeType.MANUAL}
      />
      {values.upgradeType === UpgradeType.MANUAL ? (
        <NestedFields {...testId(TestId.MANUAL)}>
          <AutocompleteField
            label={Label.VERSION}
            name={FieldName.MANUAL_VERSION}
            options={[...(availableVersions ?? [])]
              .sort(sortReverse)
              .map((version) => ({
                label: version.version,
                value: version.version,
              }))}
            style={{ width: "6rem" }}
          />
        </NestedFields>
      ) : null}
    </>
  );
};

export default Fields;
