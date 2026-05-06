import {
  Button,
  Icon,
  MultiSelect,
  Tooltip,
  type MultiSelectItem,
} from "@canonical/react-components";
import { useFormikContext } from "formik";
import type { JSX } from "react";
import { useState } from "react";

import {
  getActiveUserControllerAccess,
  getActiveUserTag,
  getIsJuju,
  getWSControllerURL,
} from "store/general/selectors";
import { useAppSelector } from "store/store";
import { testId } from "testing/utils";
import { AccessLevel } from "types";
import { getUserName } from "utils";

import type { AddModelFormState } from "../types";

import AccessLevelDropdown from "./AccessLeveLDropdown";
import { Label, TestId } from "./types";
import {
  buildActiveUser,
  buildSelectedItems,
  getAccessLevelDisabledReason,
  getHints,
  removeUser,
  getUserAccess,
} from "./utils";

const AccessManagement = (): JSX.Element => {
  const isJuju = useAppSelector(getIsJuju);
  const wsControllerURL = useAppSelector(getWSControllerURL);
  const userName = useAppSelector((state) =>
    getActiveUserTag(state, wsControllerURL),
  );
  const activeUserControllerAccess = useAppSelector((state) =>
    getActiveUserControllerAccess(state, wsControllerURL),
  );
  const { values, setFieldValue } = useFormikContext<AddModelFormState>();
  const [searchInput, setSearchInput] = useState("");

  const activeUserName = userName ? getUserName(userName) : undefined;
  const shareModelWith = values.shareModelWith ?? {};
  const ACTIVE_USER = buildActiveUser(activeUserName, shareModelWith);
  const selectedItems = buildSelectedItems(
    ACTIVE_USER,
    shareModelWith,
    activeUserName,
  );
  const trimmedSearchInput = searchInput.trim();
  const hasExactSelectedMatch = selectedItems.some(
    (item) => item.value === trimmedSearchInput,
  );
  const { addUserHint, formatHint } = getHints(!!isJuju);

  const handleItemsUpdate = (nextSelectedItems: MultiSelectItem[]): void => {
    const nextShareModelWith: Record<string, string> = {};

    for (const { value } of nextSelectedItems) {
      const key = value;
      const isActiveUserItem = key === ACTIVE_USER?.value;
      const access = shareModelWith[key];

      // Keep active user in state only when they are not admin.
      if (isActiveUserItem && access === AccessLevel.ADMIN) {
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
      AccessLevel.READ,
    );
  };

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
            searchButtonType="button"
            inputClassName="u-no-margin--bottom u-sv1--top"
            footerClassName="access-management__dropdown-footer u-no-padding--left u-no-padding--right"
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
            disabledItems={ACTIVE_USER ? [ACTIVE_USER] : []}
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
            <th className="u-no-margin--bottom">{Label.HEADER_USER_NAME}</th>
            <th className="u-no-margin--bottom access-management__access-col">
              {Label.HEADER_ACCESS_LEVEL}
            </th>
            <th className="access-management__delete-col" />
          </tr>
        </thead>
        <tbody>
          {selectedItems.map(({ label: userLabel, value: userValue }) => {
            const accessLevelDisabledReason = getAccessLevelDisabledReason(
              userValue,
              shareModelWith,
              activeUserControllerAccess,
              isJuju,
              activeUserName,
            );

            return (
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
                  {accessLevelDisabledReason ? (
                    <Tooltip
                      message={accessLevelDisabledReason}
                      position="top-center"
                      positionElementClassName="u-full-width"
                    >
                      <AccessLevelDropdown
                        value={getUserAccess(
                          userValue,
                          activeUserName,
                          ACTIVE_USER?.access,
                          shareModelWith,
                        )}
                        userName={userValue}
                        isDisabled
                      />
                    </Tooltip>
                  ) : (
                    <AccessLevelDropdown
                      value={getUserAccess(
                        userValue,
                        activeUserName,
                        ACTIVE_USER?.access,
                        shareModelWith,
                      )}
                      userName={userValue}
                    />
                  )}
                </td>
                <td className="access-management__delete-col">
                  <Button
                    hasIcon
                    appearance="base"
                    className="u-no-margin--bottom u-no-padding--top u-no-padding--bottom"
                    disabled={userValue === activeUserName}
                    onClick={() => {
                      void setFieldValue(
                        "shareModelWith",
                        removeUser(userValue, shareModelWith, activeUserName),
                      );
                    }}
                    aria-label={Label.BUTTON_DELETE}
                  >
                    <Icon name="delete" />
                  </Button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      <hr />
    </div>
  );
};

export default AccessManagement;
