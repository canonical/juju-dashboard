import {
  Button,
  CustomSelect,
  Icon,
  MultiSelect,
  type MultiSelectItem,
} from "@canonical/react-components";
import { useFormikContext } from "formik";
import type { JSX } from "react";
import { useState } from "react";

import { getActiveUserTag, getWSControllerURL } from "store/general/selectors";
import { useAppSelector } from "store/store";
import { testId } from "testing/utils";
import { getUserName } from "utils";

import type { AddModelFormState } from "../types";

import { AccessLevel, type AccessUserItem, TestId } from "./types";

const ACCESS_LEVEL_OPTIONS = [
  { label: "Admin", value: AccessLevel.ADMIN },
  { label: "Read", value: AccessLevel.READ },
  { label: "Write", value: AccessLevel.WRITE },
];

const AccessManagement = (): JSX.Element => {
  const wsControllerURL = useAppSelector(getWSControllerURL);
  const userName =
    useAppSelector((state) => getActiveUserTag(state, wsControllerURL)) ?? "";
  const activeUserName = getUserName(userName);
  const { values, setFieldValue } = useFormikContext<AddModelFormState>();

  const shareModelWith = values.shareModelWith ?? {};
  const activeUserValue = activeUserName || "active-user";
  const ACTIVE_USER: AccessUserItem = {
    label: `${activeUserName || "username"} (you)`,
    value: activeUserValue,
    access: shareModelWith[activeUserName] ?? AccessLevel.ADMIN,
  };
  const selectedItems: AccessUserItem[] = [
    ACTIVE_USER,
    ...Object.entries(shareModelWith)
      .filter(([user]) => user !== activeUserName)
      .map(([user, access]) => ({
        label: user,
        value: user,
        access,
      })),
  ];
  const [searchInput, setSearchInput] = useState("");
  const trimmedSearchInput = searchInput.trim();
  const hasExactSelectedMatch = selectedItems.some(
    (item) => item.value === trimmedSearchInput,
  );

  const handleItemsUpdate = (nextSelectedItems: MultiSelectItem[]): void => {
    const nextShareModelWith: Record<string, string> = {};

    for (const item of nextSelectedItems as AccessUserItem[]) {
      const { value: key, access } = item;

      // Keep active user in state only when they are not admin.
      if (key === ACTIVE_USER.value && access === AccessLevel.ADMIN) {
        continue;
      }

      nextShareModelWith[key] = access;
    }

    void setFieldValue("shareModelWith", nextShareModelWith);
  };

  const handleAddUser = (): void => {
    if (!trimmedSearchInput) {
      return;
    }

    void setFieldValue(
      `shareModelWith["${trimmedSearchInput}"]`,
      AccessLevel.ADMIN,
    );
  };

  return (
    <div
      {...testId(TestId.ACCESS_MANAGEMENT_FORM)}
      className="access-management"
    >
      Add users
      <div className="row u-no-padding">
        <div className="col-4">
          <MultiSelect
            id="access-management-users"
            variant="search"
            placeholder="Search and add users"
            label="Add users"
            emptyMessage="No users found"
            dropdownFooter={
              <div className="access-management__dropdown-footer">
                <h4 className="p-muted-heading u-no-padding--top p-text--small">
                  YOU CAN ADD
                </h4>
                {trimmedSearchInput && !hasExactSelectedMatch ? (
                  <Button
                    appearance="base"
                    type="button"
                    className="u-align--left"
                    onClick={handleAddUser}
                  >
                    <Icon name="plus" />
                    {trimmedSearchInput}
                  </Button>
                ) : (
                  <p className="p-form-help-text add-users">
                    Add users by entering an email address
                  </p>
                )}
              </div>
            }
            disabledItems={[ACTIVE_USER]}
            items={selectedItems}
            selectedItems={selectedItems}
            onSearchChange={setSearchInput}
            onClose={() => {
              setSearchInput("");
            }}
            onItemsUpdate={handleItemsUpdate}
          />
        </div>
      </div>
      <table className="u-no-margin--bottom">
        <thead>
          <tr className="u-flex">
            <th className="u-no-margin--bottom u-sv2--top access-management__user-col">
              User Name
            </th>
            <th className="u-no-margin--bottom u-sv2--top access-management__access-col">
              Access Level
            </th>
            <th className="u-no-margin--bottom u-sv2--top u-flex-shrink"></th>
          </tr>
        </thead>
        <tbody>
          {selectedItems.map(
            ({ label: userLabel, value: userValue }, index) => (
              <tr key={String(userValue)} className="u-flex">
                <td className="access-management__user-col">
                  <span className="u-sh1--right u-truncate" title={userLabel}>
                    {userLabel}
                  </span>
                </td>
                <td className="controller-select__cell access-management__access-col">
                  <CustomSelect
                    id={`access-level-${String(userValue)}`}
                    defaultToggleLabel="Admin"
                    toggleClassName="controller-select__toggle"
                    dropdownClassName="controller-select__dropdown prevent-panel-close"
                    value={
                      userValue === ACTIVE_USER.value
                        ? ACTIVE_USER.access
                        : (shareModelWith[String(userValue)] ??
                          AccessLevel.ADMIN)
                    }
                    // This will be enabled once we understand the flow for it
                    disabled={index === 0}
                    onChange={(accessLevel) => {
                      void setFieldValue(
                        `shareModelWith["${userValue}"]`,
                        accessLevel,
                      );
                    }}
                    options={ACCESS_LEVEL_OPTIONS}
                  />
                </td>
                <td className="u-flex-shrink">
                  <Button
                    hasIcon
                    appearance="base"
                    className="u-no-margin--bottom u-no-padding--top u-no-padding--bottom"
                    disabled={index === 0}
                    onClick={() => {
                      const {
                        [userValue]: _removedUser,
                        ...nextShareModelWith
                      } = shareModelWith;
                      void setFieldValue("shareModelWith", nextShareModelWith);
                    }}
                    aria-label="Delete"
                  >
                    <Icon name="delete" />
                  </Button>
                </td>
              </tr>
            ),
          )}
        </tbody>
      </table>
    </div>
  );
};

export default AccessManagement;
