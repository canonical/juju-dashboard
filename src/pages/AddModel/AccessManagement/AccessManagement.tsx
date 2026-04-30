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

import {
  getActiveUserTag,
  getIsJuju,
  getWSControllerURL,
} from "store/general/selectors";
import { useAppSelector } from "store/store";
import { testId } from "testing/utils";
import { getUserName } from "utils";

import type { AddModelFormState } from "../types";

import {
  AccessLevel,
  type AccessUserItem,
  AddUserHint,
  FormatHint,
  Label,
  TestId,
} from "./types";

const ACCESS_LEVEL_OPTIONS = [
  { label: "Admin", value: AccessLevel.ADMIN },
  { label: "Read", value: AccessLevel.READ },
  { label: "Write", value: AccessLevel.WRITE },
];

const AccessManagement = (): JSX.Element => {
  const isJuju = useAppSelector(getIsJuju);
  const wsControllerURL = useAppSelector(getWSControllerURL);
  const userName =
    useAppSelector((state) => getActiveUserTag(state, wsControllerURL)) ?? "";
  const activeUserName = getUserName(userName);
  const { values, setFieldValue } = useFormikContext<AddModelFormState>();

  const shareModelWith = values.shareModelWith ?? {};
  const activeUserValue = activeUserName || "active-user";
  const ACTIVE_USER: AccessUserItem = {
    label: activeUserName,
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

    for (const { value } of nextSelectedItems) {
      const key = value;
      const access = shareModelWith[key] ?? AccessLevel.ADMIN;

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

  const addUserHint = !isJuju ? AddUserHint.JIMM : AddUserHint.JUJU;
  const formatHint = !isJuju ? FormatHint.JIMM : FormatHint.JUJU;

  return (
    <div
      {...testId(TestId.ACCESS_MANAGEMENT_FORM)}
      className="access-management"
    >
      {Label.MULTI_SELECT_LABEL}
      <div className="row u-no-padding">
        <div className="col-4">
          <MultiSelect
            variant="search"
            placeholder={Label.MULTI_SELECT_PLACEHOLDER}
            label={Label.MULTI_SELECT_LABEL}
            emptyMessage={Label.MULTI_SELECT_NO_USERS}
            dropdownFooter={
              <div className="u-flex-grow">
                <h5 className="u-no-padding--top p-text--small-caps u-text--muted u-sh2 u-sv-1--top">
                  You can add
                </h5>
                {trimmedSearchInput && !hasExactSelectedMatch ? (
                  <Button
                    appearance="base"
                    type="button"
                    className="u-align--left u-full-width u-no-margin--bottom u-sv-1--top"
                    onClick={handleAddUser}
                  >
                    <Icon name="plus" className="u-sh1--right" />
                    {trimmedSearchInput}
                    <p className="u-text--muted p-text--small u-sh3 u-sv-1">
                      {formatHint}
                    </p>
                  </Button>
                ) : (
                  <p className="u-text--muted p-text--small u-sh2 u-sv-1">
                    {addUserHint}
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
          <tr className="u-sv2--top">
            <th className="u-no-margin--bottom">User Name</th>
            <th className="u-no-margin--bottom access-management__access-col">
              Access Level
            </th>
            <th className="access-management__delete-col" />
          </tr>
        </thead>
        <tbody>
          {selectedItems.map(
            ({ label: userLabel, value: userValue }, index) => (
              <tr key={userValue}>
                <td>
                  <span className="u-sh1--right u-truncate" title={userLabel}>
                    {userLabel === activeUserName ? (
                      <>
                        <b>{`${userLabel}`}</b> (you)
                      </>
                    ) : (
                      userLabel
                    )}
                  </span>
                </td>
                <td className="controller-select__cell access-management__access-col">
                  <CustomSelect
                    id={`access-level-${userValue}`}
                    defaultToggleLabel="Admin"
                    toggleClassName="controller-select__toggle"
                    dropdownClassName="controller-select__dropdown prevent-panel-close"
                    value={
                      userValue === ACTIVE_USER.value
                        ? ACTIVE_USER.access
                        : (shareModelWith[userValue] ?? AccessLevel.ADMIN)
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
                <td className="access-management__delete-col">
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
      <hr />
    </div>
  );
};

export default AccessManagement;
