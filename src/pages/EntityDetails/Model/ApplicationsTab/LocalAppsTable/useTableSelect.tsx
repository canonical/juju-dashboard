import type { MainTableRow } from "@canonical/react-components/dist/components/MainTable/MainTable";
import { useDispatch, useSelector } from "react-redux";

import useAnalytics from "hooks/useAnalytics";
import type { ApplicationData, ApplicationInfo } from "juju/types";
import { actions as jujuActions } from "store/juju";
import { getSelectedApplications } from "store/juju/selectors";
import type { Header } from "tables/tableHeaders";

export const useTableSelect = (applications: ApplicationInfo[]) => {
  let selectedApplications = useSelector(getSelectedApplications());

  const sendAnalytics = useAnalytics();

  const dispatch = useDispatch();

  const handleSelectAll = (selectAll = true) => {
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
      })
    );
  };

  const handleSelect = (application: ApplicationInfo) => {
    sendAnalytics({
      category: "ApplicationSearch",
      action: "Select application",
    });
    let apps = selectedApplications;
    if (apps.includes(application)) {
      apps = apps.filter((a) => a !== application);
    } else {
      apps = [...apps, application];
    }
    selectedApplications = apps;
    dispatch(
      jujuActions.updateSelectedApplications({
        selectedApplications: apps,
      })
    );
  };
  return {
    selectAll:
      selectedApplications.length === applications.length &&
      applications.length > 0,
    handleSelectAll,
    handleSelect,
  };
};
export const addSelectAllColumn = (
  header: Header,
  selectAll: boolean,
  handleSelectAll: (selectAll?: boolean) => void
) => {
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

const Checkbox = ({
  onSelect,
  app,
}: {
  onSelect: (app: ApplicationInfo) => void;
  app: ApplicationInfo;
}) => {
  const selectedApplications = useSelector(getSelectedApplications());
  if (!("name" in app)) {
    return null;
  }
  const fieldID = `select-app-${app.name}`;
  const handleSelect = () => {
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
  handleSelect: (application: ApplicationInfo) => void
) => {
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
