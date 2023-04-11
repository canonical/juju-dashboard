import { Button, MainTable, Icon } from "@canonical/react-components";
import { Field, Formik } from "formik";
import { useMemo, useRef, useState } from "react";
import { useSelector } from "react-redux";
import { Link, useParams } from "react-router-dom";

import ButtonGroup from "components/ButtonGroup/ButtonGroup";
import ChipGroup from "components/ChipGroup/ChipGroup";
import EntityInfo from "components/EntityInfo/EntityInfo";
import FormikFormData from "components/FormikFormData/FormikFormData";
import InfoPanel from "components/InfoPanel/InfoPanel";

import { useQueryParams } from "hooks/useQueryParams";

import { extractRevisionNumber } from "store/juju/utils/models";
import { generateStatusElement } from "components/utils";

import type { SetFieldValue } from "components/FormikFormData/FormikFormData";
import type { EntityDetailsRoute } from "components/Routes/Routes";

import {
  generateSelectableUnitTableHeaders,
  machineTableHeaders,
} from "tables/tableHeaders";
import { generateMachineRows, generateUnitRows } from "tables/tableRows";

import {
  getModelApplications,
  getModelInfo,
  getModelMachines,
  getModelUnits,
  getModelUUIDFromList,
} from "store/juju/selectors";
import urls, { AppTab } from "urls";
import type { MachineData, UnitData } from "juju/types";

import { generateMachineCounts, generateUnitCounts } from "../counts";

export enum TestId {
  MACHINES_TABLE = "machines-table",
  RUN_ACTION_BUTTON = "run-action-button",
  SELECT_ALL = "select-all",
  SHOW_ACTION_LOGS = "show-action-logs",
  UNITS_TABLE = "units-table",
}

export enum Label {
  NO_UNITS = "There are no units in this application",
}

type FormData = {
  selectAll: boolean;
  selectedUnits: string[];
};

export default function App(): JSX.Element {
  const {
    appName: entity,
    userName,
    modelName,
  } = useParams<EntityDetailsRoute>();

  const [enableActionButtonRow, setEnableActionButtonRow] =
    useState<boolean>(false);

  const tablesRef = useRef<HTMLDivElement>(null);
  const setFieldsValues = useRef<SetFieldValue<FormData>>();
  const selectedUnits = useRef<string[]>([]);
  const selectAll = useRef<boolean>(false);

  const modelUUID = useSelector(getModelUUIDFromList(modelName, userName));
  const applications = useSelector(getModelApplications(modelUUID));
  const units = useSelector(getModelUnits(modelUUID));
  const machines = useSelector(getModelMachines(modelUUID));
  const modelData = useSelector(getModelInfo(modelUUID));

  const filteredMachineList = useMemo(() => {
    const filteredMachines: MachineData = {};
    if (!units || !machines) {
      return null;
    }
    Object.entries(units).forEach(([unitId, unitData]) => {
      if (unitData.application === entity) {
        const machineId = unitData["machine-id"];
        if (machineId && machines[machineId]) {
          filteredMachines[machineId] = machines[machineId];
        }
      }
    });
    return filteredMachines;
  }, [units, machines, entity]);

  const machinesPanelRows = useMemo(
    () =>
      modelName && userName
        ? generateMachineRows(filteredMachineList, units, {
            modelName,
            userName,
          })
        : [],
    [filteredMachineList, units, modelName, userName]
  );

  const hideMachines = modelData?.type === "kubernetes";

  const unitTableHeaders = useMemo(() => {
    const fieldID = "unit-list-select-all";
    return generateSelectableUnitTableHeaders(
      {
        content: (
          <label className="p-checkbox--inline" htmlFor={fieldID}>
            <Field
              id={fieldID}
              type="checkbox"
              aria-labelledby="select-all-units"
              className="p-checkbox__input"
              name="selectAll"
              data-testid={TestId.SELECT_ALL}
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
    () =>
      modelName && userName
        ? generateUnitRows(
            filteredUnitList,
            { modelName, userName },
            true,
            hideMachines
          )
        : [],
    [filteredUnitList, modelName, userName, hideMachines]
  );

  const [query, setQuery] = useQueryParams<{
    tableView: string;
    activeView: string;
    entity: string | null;
    panel: string | null;
    units: string[];
  }>({
    tableView: "units",
    activeView: "apps",
    entity: null,
    panel: null,
    units: [],
  });

  const showConfig = () => {
    setQuery({ panel: "config", entity: entity }, { replace: true });
  };

  const application = entity ? applications?.[entity] : null;

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

  const showActions = () => {
    setQuery(
      { panel: "execute-action", units: selectedUnits.current },
      { replace: true }
    );
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
      if (query.panel === "execute-action") {
        selectedUnits.current = formData.selectedUnits;
        showActions();
      }
    }
    selectedUnits.current = formData.selectedUnits;
    setEnableActionButtonRow(formData.selectedUnits.length > 0);
  };

  const onSetup = (setFieldValue: SetFieldValue<FormData>) => {
    setFieldsValues.current = setFieldValue;
  };

  return (
    <>
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
      <div className="entity-details__main u-overflow--auto">
        {!hideMachines && (
          <ButtonGroup
            buttons={["units", "machines"].map((tab) => ({
              children: tab,
              key: tab,
              to:
                userName && modelName && entity
                  ? urls.model.app.tab({
                      userName,
                      modelName,
                      appName: entity,
                      tab: tab as AppTab,
                    })
                  : "",
            }))}
            buttonComponent={Link}
            activeButton={query.tableView}
          />
        )}
        <div className="entity-details__tables" ref={tablesRef}>
          {query.tableView === "units" && (
            <>
              <ChipGroup chips={unitChipData} descriptor="units" />
              <div className="entity-details__action-button-row">
                <Button
                  appearance="base"
                  className="entity-details__action-button"
                  hasIcon={true}
                  onClick={showActions}
                  disabled={!enableActionButtonRow}
                  data-testid={TestId.RUN_ACTION_BUTTON}
                >
                  <Icon name="run-action" />
                  <span>Run action</span>
                </Button>
                <span className="entity-details__action-button-divider"></span>
                <Button
                  element={Link}
                  appearance="base"
                  className="entity-details__action-button"
                  hasIcon={true}
                  data-testid={TestId.SHOW_ACTION_LOGS}
                  to={
                    userName && modelName
                      ? urls.model.tab({
                          userName,
                          modelName,
                          tab: "action-logs",
                        })
                      : ""
                  }
                >
                  <Icon name="action-logs" />
                  <span>View Action Logs</span>
                </Button>
              </div>
              <Formik
                initialValues={{
                  selectAll: false,
                  selectedUnits: [],
                }}
                onSubmit={() => {
                  // Nothing is done on form submission.
                }}
              >
                <FormikFormData onFormChange={onFormChange} onSetup={onSetup}>
                  <MainTable
                    headers={unitTableHeaders}
                    rows={unitPanelRows}
                    className="entity-details__units p-main-table panel__table has-checkbox"
                    sortable
                    emptyStateMsg={Label.NO_UNITS}
                    data-testid={TestId.UNITS_TABLE}
                  />
                </FormikFormData>
              </Formik>
            </>
          )}
          {query.tableView === "machines" && (
            <>
              <ChipGroup chips={machineChipData} descriptor="machines" />
              <MainTable
                headers={machineTableHeaders}
                rows={machinesPanelRows}
                className="entity-details__machines p-main-table panel__table"
                sortable
                emptyStateMsg={"There are no machines in this model"}
                data-testid={TestId.MACHINES_TABLE}
              />
            </>
          )}
        </div>
      </div>
    </>
  );
}
