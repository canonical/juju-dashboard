import { FormikField } from "@canonical/react-components";
import { useFormikContext } from "formik";
import type { FC } from "react";

import AutocompleteField from "components/AutocompleteField";
import NestedFields from "components/NestedFields";
import type { Version } from "panels/UpgradeModelPanel/types";
import { testId } from "testing/utils";
import isHigherSemver from "utils/isHigherSemver";

import RecommendedVersion from "../RecommendedVersion";
import type { FormFields } from "../types";
import { FieldName, UpgradeType } from "../types";
import { getRecommendedVersions, versions } from "../utils";

import { Label, TestId } from "./types";

type Props = {
  currentVersion: string;
};

// Sort by semver so that the highest version comes first.
const sortReverse = (versionA: Version, versionB: Version): number => {
  if (versionA.version === versionB.version) {
    return 0;
  }
  return isHigherSemver(versionA.version, versionB.version) ? -1 : 1;
};

const Fields: FC<Props> = ({ currentVersion }) => {
  const recommendedVersions = getRecommendedVersions(versions);
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
              currentVersion={currentVersion}
              key={version.version}
              name={FieldName.RECOMMENDED_VERSION}
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
            options={versions.sort(sortReverse).map((version) => ({
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
