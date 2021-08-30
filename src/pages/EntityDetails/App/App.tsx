import { useMemo, useRef, useState } from "react";
import { Formik, Field } from "formik";
import { useParams, useHistory } from "react-router-dom";
import { useSelector } from "react-redux";
import {
  useQueryParam,
  useQueryParams,
  ArrayParam,
  StringParam,
  withDefault,
} from "use-query-params";
import Button from "@canonical/react-components/dist/components/Button";
import MainTable from "@canonical/react-components/dist/components/MainTable";

import ButtonGroup from "components/ButtonGroup/ButtonGroup";
import InfoPanel from "components/InfoPanel/InfoPanel";
import EntityInfo from "components/EntityInfo/EntityInfo";
import ChipGroup from "components/ChipGroup/ChipGroup";
import FormikFormData from "components/FormikFormData/FormikFormData";

import EntityDetails from "pages/EntityDetails/EntityDetails";

import useTableRowClick from "hooks/useTableRowClick";

import { extractRevisionNumber, generateStatusElement } from "app/utils/utils";

import type { EntityDetailsRoute } from "components/Routes/Routes";
import type { SetFieldValue } from "components/FormikFormData/FormikFormData";

import { generateMachineRows, generateUnitRows } from "tables/tableRows";
import {
  machineTableHeaders,
  generateSelectableUnitTableHeaders,
} from "tables/tableHeaders";

import runActionImage from "static/images/run-action-icon.svg";
import actionLogsImage from "static/images/action-logs-icon.svg";

import {
  getModelApplications,
  getModelInfo,
  getModelMachines,
  getModelUnits,
  getModelUUID,
} from "juju/model-selectors";

import type { MachineData, UnitData } from "juju/types";

import { generateMachineCounts, generateUnitCounts } from "../counts";

type FormData = {
  selectAll: boolean;
  selectedUnits: string[];
};

export default function App(): JSX.Element {
  const history = useHistory();
  const {
    appName: entity,
    userName,
    modelName,
  } = useParams<EntityDetailsRoute>();

  const [enableActionButtonRow, setEnableActionButtonRow] =
    useState<boolean>(false);

  const tablesRef = useRef<HTMLDivElement>(null);
  const setFieldsValues = useRef<SetFieldValue>();
  const selectedUnits = useRef<string[]>([]);
  const selectAll = useRef<boolean>(false);

  const modelUUID = useSelector(getModelUUID(modelName, userName));
  const applications = useSelector(getModelApplications(modelUUID));
  const units = useSelector(getModelUnits(modelUUID));
  const machines = useSelector(getModelMachines(modelUUID));
  const modelData = useSelector(getModelInfo(modelUUID));

  const tableRowClick = useTableRowClick();

  const filteredMachineList = useMemo(() => {
    const filteredMachines: MachineData = {};
    if (!units || !machines) {
      return null;
    }
    Object.entries(units).forEach(([unitId, unitData]) => {
      if (unitData.application === entity) {
        const machineId = unitData["machine-id"];
        filteredMachines[machineId] = machines[machineId];
      }
    });
    return filteredMachines;
  }, [units, machines, entity]);

  const machinesPanelRows = useMemo(
    () => generateMachineRows(filteredMachineList, units, tableRowClick),
    [filteredMachineList, units, tableRowClick]
  );

  const hideMachines = modelData?.type === "kubernetes";

  const unitTableHeaders = useMemo(() => {
    const fieldID = "unit-list-select-all";
    return generateSelectableUnitTableHeaders(
      {
        content: (
          <label className="p-checkbox" htmlFor={fieldID}>
            <Field
              id={fieldID}
              type="checkbox"
              aria-labelledby="select-all-units"
              className="p-checkbox__input"
              name="selectAll"
            />
            <span className="p-checkbox__label" id="select-all-units"></span>
          </label>
        ),
        sortKey: "",
        className: "select-unit",
      },
      hideMachines
    );
  }, [hideMachines]);

  const filteredUnitList = useMemo(() => {
    if (!units) {
      return null;
    }
    const filteredUnits: UnitData = {};
    Object.entries(units).forEach(([unitId, unitData]) => {
      if (
        unitData.application === entity ||
        // Add any units that are a subordinate to the parent to the list
        // It will be re-sorted in the unit table generation code.
        (unitData.subordinate && unitData.principal.split("/")[0] === entity)
      ) {
        filteredUnits[unitId] = unitData;
      }
    });
    return filteredUnits;
  }, [units, entity]);

  const unitPanelRows = useMemo(
    () => generateUnitRows(filteredUnitList, tableRowClick, true, hideMachines),
    [filteredUnitList, tableRowClick, hideMachines]
  );

  const [tableView, setTableView] = useQueryParam(
    "tableview",
    withDefault(StringParam, "units")
  );

  const [query, setQuery] = useQueryParams({
    activeView: withDefault(StringParam, "apps"),
    entity: StringParam,
    panel: StringParam,
  });

  const showConfig = () => {
    query && setQuery({ panel: "config", entity: entity });
  };

  const application = applications?.[entity];

  let appEntityData = {};
  if (application) {
    appEntityData = {
      status: generateStatusElement(application.status?.current),
      charm: application["charm-url"],
      os: "Ubuntu",
      revision: extractRevisionNumber(application["charm-url"]) || "-",
      message: "-",
      provider: modelData?.type || "-",
    };
  }

  const unitChipData = useMemo(
    () => generateUnitCounts(units, entity),
    [units, entity]
  );

  const machineChipData = useMemo(
    () => generateMachineCounts(machines, units, entity),
    [machines, units, entity]
  );

  const [panel, setPanel] = useQueryParams({
    panel: StringParam,
    units: ArrayParam,
  });
  const showActions = () => {
    setPanel({ panel: "execute-action", units: selectedUnits.current });
  };

  const navigateActionLogs = () => {
    history.push(`/models/${userName}/${modelName}?activeView=action-logs`);
  };

  const onFormChange = (formData: FormData) => {
    if (!setFieldsValues.current) return;
    // If the app is a subordinate and has not been related to any other apps
    // then its unit list will be `null`.

    let unitList: string[] = [];
    if (units) {
      unitList = Object.keys(units).filter(
        (unitId) => units[unitId].application === entity
      );
    }

    // Handle the selectAll checkbox interactions.
    if (selectAll.current && !formData.selectAll) {
      if (selectedUnits.current.length === unitList.length) {
        // Only reset them all to unchecked if they were all checked to
        // begin with. This is to fix the issue when you uncheck one unit
        // and it changes the selectAll button.
        setFieldsValues.current("selectedUnits", []);
      }
    } else if (!selectAll.current && formData.selectAll) {
      // The user has switched the selectAll checkbox from unchecked to checked.
      setFieldsValues.current("selectedUnits", unitList);
    }
    selectAll.current = formData.selectAll;

    // Handle the unit checkbox interactions.
    if (
      selectedUnits.current.length !== unitList.length &&
      formData.selectedUnits.length === unitList.length
    ) {
      // If the user has checked all of the unit checkboxes.
      setFieldsValues.current("selectAll", true);
    } else if (
      selectedUnits.current.length === unitList.length &&
      formData.selectedUnits.length !== unitList.length
    ) {
      // If the user has unchecked some of the unit checkboxes.
      setFieldsValues.current("selectAll", false);
    }
    if (selectedUnits.current.length !== formData.selectedUnits.length) {
      // The user has updated the selected list of units so update the
      // query param that stores the unit list.
      if (panel.panel === "execute-action") {
        selectedUnits.current = formData.selectedUnits;
        showActions();
      }
    }
    selectedUnits.current = formData.selectedUnits;
    setEnableActionButtonRow(formData.selectedUnits.length > 0);
  };

  const onSetup = (setFieldValue: SetFieldValue) => {
    setFieldsValues.current = setFieldValue;
  };

  return (
    <EntityDetails type="app" className="entity-details__app">
      <div>
        <InfoPanel />
        <>
          <div className="entity-details__actions">
            <button
              className="entity-details__action-button"
              onClick={showConfig}
            >
              <i className="p-icon--settings"></i>Configure
            </button>
          </div>
          <EntityInfo data={appEntityData} />
        </>
      </div>
      <div className="entity-details__main u-overflow--scroll">
        {!hideMachines && (
          <ButtonGroup
            buttons={["units", "machines"]}
            activeButton={tableView}
            setActiveButton={setTableView}
          />
        )}
        <div className="entity-details__tables" ref={tablesRef}>
          {tableView === "units" && (
            <>
              <ChipGroup chips={unitChipData} descriptor="units" />
              <div className="entity-details__action-button-row">
                <Button
                  appearance="base"
                  className="entity-details__action-button"
                  hasIcon={true}
                  onClick={showActions}
                  disabled={!enableActionButtonRow}
                  data-test="run-action-button"
                >
                  <img
                    className="entity-details__action-button-row-icon"
                    src={runActionImage}
                    alt=""
                  />
                  Run action
                </Button>
                <span className="entity-details__action-button-divider"></span>
                <Button
                  appearance="base"
                  className="entity-details__action-button"
                  hasIcon={true}
                  onClick={navigateActionLogs}
                  data-test="show-action-logs"
                >
                  <img
                    className="entity-details__action-button-row-icon"
                    src={actionLogsImage}
                    alt=""
                  />
                  View Action Logs
                </Button>
              </div>
              <Formik
                initialValues={{
                  selectAll: false,
                  selectedUnits: [],
                }}
                onSubmit={() => {}}
              >
                <FormikFormData onFormChange={onFormChange} onSetup={onSetup}>
                  <MainTable
                    headers={unitTableHeaders}
                    rows={unitPanelRows}
                    className="entity-details__units p-main-table panel__table has-checkbox"
                    sortable
                    emptyStateMsg={"There are no units in this application"}
                    data-test="units-table"
                  />
                </FormikFormData>
              </Formik>
            </>
          )}
          {tableView === "machines" && (
            <>
              <ChipGroup chips={machineChipData} descriptor="machines" />
              <MainTable
                headers={machineTableHeaders}
                rows={machinesPanelRows}
                className="entity-details__machines p-main-table panel__table"
                sortable
                emptyStateMsg={"There are no machines in this model"}
                data-test="machines-table"
              />
            </>
          )}
        </div>
      </div>
    </EntityDetails>
  );
}
