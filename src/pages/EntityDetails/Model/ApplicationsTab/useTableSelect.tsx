import { MainTableRow } from "@canonical/react-components/dist/components/MainTable/MainTable";
import useAnalytics from "hooks/useAnalytics";
import { ApplicationData, ApplicationInfo } from "juju/types";
import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { actions as jujuActions } from "store/juju";
import { Header } from "tables/tableHeaders";

export const useTableSelect = (applications: ApplicationInfo[]) => {
  const [selectedApplications, setSelectedApplications] = useState<
    ApplicationInfo[]
  >([]);
  const sendAnalytics = useAnalytics();

  const [selectAll, setSelectAll] = useState<boolean>(false);
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(jujuActions.updateSelectedApplications({ selectedApplications }));
  }, [dispatch, selectedApplications]);

  useEffect(() => {
    if (selectedApplications.length === applications.length) {
      setSelectAll(true);
    } else if (selectAll) {
      setSelectAll(false);
    }
  }, [applications.length, selectAll, selectedApplications]);

  const handleSelectAll = () => {
    sendAnalytics({
      category: "ApplicationSearch",
      action: "Select all applications",
    });
    if (selectAll) {
      setSelectedApplications([]);
    } else {
      setSelectedApplications(applications);
    }
    setSelectAll(!selectAll);
  };

  const handleSelect = (application: ApplicationInfo) => {
    sendAnalytics({
      category: "ApplicationSearch",
      action: "Select application",
    });
    if (selectedApplications.includes(application)) {
      setSelectedApplications(
        selectedApplications.filter((a) => a !== application)
      );
    } else {
      setSelectedApplications([...selectedApplications, application]);
    }
  };

  return {
    selectedApplications,
    selectAll,
    handleSelectAll,
    handleSelect,
    reset: () => {
      setSelectedApplications([]);
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
          />
          <span className="p-checkbox__label"></span>
        </label>
      ),
    },
    ...header,
  ];
};
export const addSelectColumn = (
  rows: MainTableRow[],
  applications: ApplicationData,
  selectedApplications: ApplicationInfo[],
  handleSelect: (application: ApplicationInfo) => void
) => {
  const apps = Object.values(applications);
  return rows.map((row, i) => {
    const app = apps[i];
    const fieldID = `select-app-${app.name}`;

    return {
      ...row,
      columns: [
        {
          content: (
            <label className="p-checkbox--inline" htmlFor={fieldID}>
              <input
                type="checkbox"
                className="p-checkbox__input"
                id={fieldID}
                name="selectApp"
                onChange={() => handleSelect(app)}
                checked={selectedApplications.includes(app)}
              />
              <span className="p-checkbox__label"></span>
            </label>
          ),
        },
        ...(row.columns || []),
      ],
    };
  });
};
