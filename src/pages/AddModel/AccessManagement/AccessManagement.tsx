import { FormikField, MultiSelect } from "@canonical/react-components";
import type { JSX } from "react";

import { testId } from "testing/utils";

import { TestId } from "./types";

const AccessManagement = (): JSX.Element => {
  return (
    <div
      {...testId(TestId.ACCESS_MANAGEMENT_FORM)}
      className="user-multi-select"
    >
      <label
        className="p-checkbox--inline multi-select-label"
        htmlFor="multi-select-users"
      >
        Add users
        <FormikField
          variant="search"
          name="multi-select-users"
          component={MultiSelect}
          showDropdownFooter={false}
          disabledItems={[{ label: "&username (you)", value: "active-user" }]}
          items={[
            { label: "&username (you)", value: "active-user" },
            { label: "user1", value: "user1" },
            { label: "user2", value: "user2" },
            { label: "bob", value: "bob" },
          ]}
          selectedItems={[{ label: "&username (you)", value: "active-user" }]}
        />
      </label>
    </div>
  );
};

export default AccessManagement;
