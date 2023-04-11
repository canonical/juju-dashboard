import { MainTableRow } from "@canonical/react-components/dist/components/MainTable/MainTable";
import useAnalytics from "hooks/useAnalytics";
import { ApplicationData, ApplicationInfo } from "juju/types";
import { useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { actions as jujuActions } from "store/juju";
import { getSelectedApplications } from "store/juju/selectors";
import { Header } from "tables/tableHeaders";

export const useTableSelect = (applications: ApplicationInfo[]) => {
  const selectedApplications = useRef<ApplicationInfo[]>([]);

  const sendAnalytics = useAnalytics();

  const [selectAll, setSelectAll] = useState<boolean>(false);
  const dispatch = useDispatch();

  const handleSelectAll = () => {
    sendAnalytics({
      category: "ApplicationSearch",
      action: "Select all applications",
    });
    if (selectAll) {
      selectedApplications.current = [];
    } else {
      selectedApplications.current = applications;
    }
    setSelectAll(!selectAll);
    dispatch(
      jujuActions.updateSelectedApplications({
        selectedApplications: selectedApplications.current,
      })
    );
  };

  const handleSelect = (application: ApplicationInfo) => {
    sendAnalytics({
      category: "ApplicationSearch",
      action: "Select application",
    });
    let apps = selectedApplications.current;
    if (apps.includes(application)) {
      apps = apps.filter((a) => a !== application);
    } else {
      apps = [...apps, application];
    }
    if (apps.length === applications.length) {
      setSelectAll(true);
    } else if (selectAll) {
      setSelectAll(false);
    }
    selectedApplications.current = apps;
    dispatch(
      jujuActions.updateSelectedApplications({
        selectedApplications: apps,
      })
    );
  };

  return {
    selectAll,
    handleSelectAll,
    handleSelect,
    reset: () => {
      selectedApplications.current = [];
      setSelectAll(false);
    },
  };
};
export const addSelectAllColumn = (
  header: Header,
  selectAll: boolean,
  handleSelectAll: () => void
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
            onChange={handleSelectAll}
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
