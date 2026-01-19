import type { ApplicationStatus } from "@canonical/jujulib/dist/api/facades/client/ClientV7";
import type {
  MainTableCell,
  MainTableRow,
} from "@canonical/react-components/dist/components/MainTable/MainTable";
import type { FC } from "react";
import { useDispatch } from "react-redux";

import useAnalytics from "hooks/useAnalytics";
import { actions as jujuActions } from "store/juju";
import { getSelectedApplications } from "store/juju/selectors";
import { useAppSelector } from "store/store";
import type { Header } from "tables/tableHeaders";
import { testId } from "testing/utils";

import { TestId } from "./types";

type SelectHandlers = {
  selectAll: boolean;
  handleSelectAll: (selectAll?: boolean) => void;
  handleSelect: (application: ApplicationStatus, name: string) => void;
};

type Props = {
  onSelect: (app: ApplicationStatus, name: string) => void;
  app: ApplicationStatus;
  name: string;
};

export const useTableSelect = (
  applications: Record<string, ApplicationStatus>,
): SelectHandlers => {
  let selectedApplications = useAppSelector(getSelectedApplications);

  const sendAnalytics = useAnalytics();

  const dispatch = useDispatch();

  const handleSelectAll = (selectAll = true): void => {
    sendAnalytics({
      category: "ApplicationSearch",
      action: "Select all applications",
    });
    if (!selectAll) {
      selectedApplications = {};
    } else {
      selectedApplications = applications;
    }
    dispatch(
      jujuActions.updateSelectedApplications({
        selectedApplications: selectedApplications,
      }),
    );
  };

  const handleSelect = (application: ApplicationStatus, name: string): void => {
    sendAnalytics({
      category: "ApplicationSearch",
      action: "Select application",
    });
    const apps = { ...selectedApplications };
    if (name in apps) {
      delete apps[name];
    } else {
      apps[name] = application;
    }
    selectedApplications = apps;
    dispatch(
      jujuActions.updateSelectedApplications({
        selectedApplications: apps,
      }),
    );
  };
  return {
    selectAll:
      Object.keys(selectedApplications).length ===
      Object.keys(applications).length,
    handleSelectAll,
    handleSelect,
  };
};
export const addSelectAllColumn = (
  header: Header | MainTableCell[],
  selectAll: boolean,
  handleSelectAll: (selectAll?: boolean) => void,
): MainTableCell[] => {
  return [
    {
      content: (
        <label className="p-checkbox--inline" htmlFor="select-all">
          <input
            type="checkbox"
            className="p-checkbox__input"
            id="select-all"
            name="selectAll"
            onChange={() => {
              handleSelectAll(!selectAll);
            }}
            checked={selectAll}
            {...testId(TestId.SELECT_ALL)}
          />
          <span className="p-checkbox__label"></span>
        </label>
      ),
    },
    ...header,
  ];
};

// eslint-disable-next-line react-refresh/only-export-components
const Checkbox: FC<Props> = ({ onSelect, app, name }) => {
  const selectedApplications = useAppSelector(getSelectedApplications);
  const fieldID = `select-app-${name}`;
  const handleSelect = (): void => {
    onSelect(app, name);
  };
  return (
    <label className="p-checkbox--inline" htmlFor={fieldID}>
      <input
        type="checkbox"
        className="p-checkbox__input"
        id={fieldID}
        name="selectApp"
        onChange={handleSelect}
        checked={name in selectedApplications}
        {...testId(`select-app-${name}`)}
      />
      <span className="p-checkbox__label"></span>
    </label>
  );
};

export const addSelectColumn = (
  rows: MainTableRow[],
  applications: Record<string, ApplicationStatus>,
  handleSelect: (application: ApplicationStatus, name: string) => void,
): MainTableRow[] => {
  return rows.map((row) => {
    const name =
      "data-app" in row &&
      row["data-app"] &&
      typeof row["data-app"] === "string"
        ? row["data-app"]
        : null;
    const app = name && name in applications ? applications[name] : null;
    return {
      ...row,
      columns: [
        {
          content:
            name && app ? (
              <Checkbox app={app} onSelect={handleSelect} name={name} />
            ) : null,
        },
        ...(row.columns ?? []),
      ],
    };
  });
};
