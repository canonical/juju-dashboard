import { CustomSelect } from "@canonical/react-components";
import { useFormikContext } from "formik";
import type { JSX } from "react";

import type { AddModelFormState } from "pages/AddModel/types";
import { AccessLevel } from "types";

type Props = {
  value: string;
  userName: number | string;
  isDisabled?: boolean;
};

const ACCESS_LEVEL_OPTIONS = [
  { label: "Admin", value: AccessLevel.ADMIN },
  { label: "Read", value: AccessLevel.READ },
  { label: "Write", value: AccessLevel.WRITE },
];

const AccessLevelDropdown = ({
  value,
  userName,
  isDisabled = false,
}: Props): JSX.Element => {
  const { setFieldValue } = useFormikContext<AddModelFormState>();

  return (
    <CustomSelect
      id={`access-level-${userName}`}
      toggleClassName="controller-select__toggle"
      dropdownClassName="controller-select__dropdown"
      value={value}
      disabled={isDisabled}
      onChange={(accessLevel) => {
        void setFieldValue(`shareModelWith["${userName}"]`, accessLevel);
      }}
      options={ACCESS_LEVEL_OPTIONS}
    />
  );
};

export default AccessLevelDropdown;
