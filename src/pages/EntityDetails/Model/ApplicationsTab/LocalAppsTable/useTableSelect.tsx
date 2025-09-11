import type {
  MainTableCell,
  MainTableRow,
} from "@canonical/react-components/dist/components/MainTable/MainTable";
import type { FC } from "react";
import { useDispatch } from "react-redux";

import useAnalytics from "hooks/useAnalytics";
import type { ApplicationData, ApplicationInfo } from "juju/types";
import { actions as jujuActions } from "store/juju";
import { getSelectedApplications } from "store/juju/selectors";
import { useAppSelector } from "store/store";
import type { Header } from "tables/tableHeaders";

type SelectHandlers = {
  selectAll: boolean;
  handleSelectAll: (selectAll?: boolean) => void;
  handleSelect: (application: ApplicationInfo) => void;
};

type Props = {
  onSelect: (app: ApplicationInfo) => void;
  app: ApplicationInfo;
};

export const useTableSelect = (
  applications: ApplicationInfo[],
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
      selectedApplications = [];
    } else {
      selectedApplications = applications;
    }
    dispatch(
      jujuActions.updateSelectedApplications({
        selectedApplications: selectedApplications,
      }),
    );
  };

  const handleSelect = (application: ApplicationInfo): void => {
    sendAnalytics({
      category: "ApplicationSearch",
      action: "Select application",
    });
    let apps = selectedApplications;
    if (apps.includes(application)) {
      apps = apps.filter((testApplication) => testApplication !== application);
    } else {
      apps = [...apps, application];
    }
    selectedApplications = apps;
    dispatch(
      jujuActions.updateSelectedApplications({
        selectedApplications: apps,
      }),
    );
  };
  return {
    selectAll: selectedApplications.length === applications.length,
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
            onChange={() => handleSelectAll(!selectAll)}
            checked={selectAll}
            data-testid="select-all-apps"
          />
          <span className="p-checkbox__label"></span>
        </label>
      ),
    },
    ...header,
  ];
};

// eslint-disable-next-line react-refresh/only-export-components
const Checkbox: FC<Props> = ({ onSelect, app }) => {
  const selectedApplications = useAppSelector(getSelectedApplications);
  if (!("name" in app)) {
    return null;
  }
  const fieldID = `select-app-${app.name}`;
  const handleSelect = (): void => {
    onSelect(app);
  };
  return (
    <label className="p-checkbox--inline" htmlFor={fieldID}>
      <input
        type="checkbox"
        className="p-checkbox__input"
        id={fieldID}
        name="selectApp"
        onChange={handleSelect}
        checked={selectedApplications.includes(app)}
        data-testid={`select-app-${app.name}`}
      />
      <span className="p-checkbox__label"></span>
    </label>
  );
};

export const addSelectColumn = (
  rows: MainTableRow[],
  applications: ApplicationData,
  handleSelect: (application: ApplicationInfo) => void,
): MainTableRow[] => {
  const apps = Object.values(applications);
  return rows.map((row, i) => {
    const app = apps[i];
    return {
      ...row,
      columns: [
        {
          content: <Checkbox app={app} onSelect={handleSelect} />,
        },
        ...(row.columns || []),
      ],
    };
  });
};
