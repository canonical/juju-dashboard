import { Button, MainTable, Icon } from "@canonical/react-components";
import classNames from "classnames";
import { Field, Formik } from "formik";
import type { JSX } from "react";
import { useMemo, useRef, useState } from "react";
import { Link, useParams } from "react-router";

import ChipGroup from "components/ChipGroup";
import EntityInfo from "components/EntityInfo";
import FormikFormData from "components/FormikFormData";
import type { SetFieldValue } from "components/FormikFormData";
import InfoPanel from "components/InfoPanel";
import type { EntityDetailsRoute } from "components/Routes";
import SegmentedControl from "components/SegmentedControl";
import Status from "components/Status";
import useCanConfigureModel from "hooks/useCanConfigureModel";
import { useQueryParams } from "hooks/useQueryParams";
import {
  getAppMachines,
  getAppUnits,
  getModelApplications,
  getModelInfo,
  getModelMachines,
  getModelUUIDFromList,
  isKubernetesModel,
} from "store/juju/selectors";
import { extractRevisionNumber } from "store/juju/utils/models";
import { useAppSelector } from "store/store";
import {
  generateSelectableUnitTableHeaders,
  machineTableHeaders,
} from "tables/tableHeaders";
import { generateMachineRows, generateUnitRows } from "tables/tableRows";
import { testId } from "testing/utils";
import type { AppTab } from "urls";
import { ModelTab } from "urls";
import urls from "urls";

import { generateMachineCounts, generateUnitCounts } from "../counts";

import { Label, TestId } from "./types";

type AppFormData = {
  selectAll: boolean;
  selectedUnits: string[];
};

export default function App(): JSX.Element {
  const {
    appName: entity,
    qualifier,
    modelName,
  } = useParams<EntityDetailsRoute>();

  const [enableActionButtonRow, setEnableActionButtonRow] =
    useState<boolean>(false);

  const tablesRef = useRef<HTMLDivElement>(null);
  const setFieldsValues = useRef<SetFieldValue<AppFormData>>(null);
  const selectedUnits = useRef<string[]>([]);
  const selectAll = useRef<boolean>(false);

  const modelUUID = useAppSelector((state) =>
    getModelUUIDFromList(state, modelName, qualifier),
  );
  const applications = useAppSelector((state) =>
    getModelApplications(state, modelUUID),
  );
  const application =
    entity && applications && entity in applications
      ? applications[entity]
      : null;
  const units = application ? application.units : null;
  const machines = useAppSelector((state) =>
    getModelMachines(state, modelUUID),
  );
  const modelData = useAppSelector((state) => getModelInfo(state, modelUUID));
  const hideMachines = useAppSelector((state) =>
    isKubernetesModel(state, modelUUID),
  );
  const canConfigureModel = useCanConfigureModel();
  const filteredMachineList = useAppSelector((state) =>
    getAppMachines(state, modelUUID, entity),
  );
  const filteredUnitList = useAppSelector((state) =>
    getAppUnits(state, modelUUID, entity),
  );

  const machinesPanelRows = useMemo(
    () =>
      modelName && qualifier
        ? generateMachineRows(filteredMachineList, applications, {
            modelName,
            qualifier,
          })
        : [],
    [filteredMachineList, applications, modelName, qualifier],
  );

  const unitTableHeaders = useMemo(() => {
    const fieldID = "unit-list-select-all";
    return generateSelectableUnitTableHeaders(
      canConfigureModel
        ? {
            content: (
              <label className="p-checkbox--inline" htmlFor={fieldID}>
                <Field
                  id={fieldID}
                  type="checkbox"
                  aria-labelledby="select-all-units"
                  className="p-checkbox__input"
                  name="selectAll"
                  {...testId(TestId.SELECT_ALL)}
                />
                <span
                  className="p-checkbox__label"
                  id="select-all-units"
                ></span>
              </label>
            ),
            sortKey: "",
            className: "select-unit",
          }
        : null,
      hideMachines,
    );
  }, [canConfigureModel, hideMachines]);

  const unitPanelRows = useMemo(
    () =>
      modelName && qualifier
        ? generateUnitRows(
            applications,
            filteredUnitList,
            { modelName, qualifier },
            canConfigureModel,
            hideMachines,
          )
        : [],
    [
      modelName,
      qualifier,
      applications,
      filteredUnitList,
      canConfigureModel,
      hideMachines,
    ],
  );

  const [query, setQuery] = useQueryParams<{
    tableView: string;
    activeView: string;
    charm: null | string;
    entity: null | string;
    modelUUID: null | string;
    panel: null | string;
    units: string[];
  }>({
    tableView: "units",
    activeView: "apps",
    charm: null,
    entity: null,
    modelUUID: null,
    panel: null,
    units: [],
  });

  const showConfig = (event: React.MouseEvent): void => {
    event.stopPropagation();
    if (application?.charm) {
      setQuery(
        {
          panel: "config",
          entity,
          charm: application?.charm,
          modelUUID,
        },
        { replace: true },
      );
    }
  };

  let appEntityData = {};
  if (application?.charm) {
    appEntityData = {
      status: <Status status={application.status?.status} />,
      charm: application.charm,
      os: "Ubuntu",
      revision: extractRevisionNumber(application.charm) || "-",
      message: "-",
      provider: modelData?.type || "-",
    };
  }

  const unitChipData = useMemo(
    () => generateUnitCounts(applications, entity),
    [applications, entity],
  );

  const machineChipData = useMemo(
    () => generateMachineCounts(machines, applications, entity),
    [machines, applications, entity],
  );

  const showActions = (): void => {
    setQuery(
      { panel: "execute-action", units: selectedUnits.current },
      { replace: true },
    );
  };

  const onFormChange = (formData: AppFormData): void => {
    if (!setFieldsValues.current) {
      return;
    }
    // If the app is a subordinate and has not been related to any other apps
    // then its unit list will be `null`.

    const unitList: string[] = Object.keys(units ?? {});

    // Handle the selectAll checkbox interactions.
    if (selectAll.current && !formData.selectAll) {
      if (selectedUnits.current.length === unitList.length) {
        // Only reset them all to unchecked if they were all checked to
        // begin with. This is to fix the issue when you uncheck one unit
        // and it changes the selectAll button.
        void setFieldsValues.current("selectedUnits", []);
      }
    } else if (!selectAll.current && formData.selectAll) {
      // The user has switched the selectAll checkbox from unchecked to checked.
      void setFieldsValues.current("selectedUnits", unitList);
    }
    selectAll.current = formData.selectAll;

    // Handle the unit checkbox interactions.
    if (
      selectedUnits.current.length !== unitList.length &&
      formData.selectedUnits.length === unitList.length
    ) {
      // If the user has checked all of the unit checkboxes.
      void setFieldsValues.current("selectAll", true);
    } else if (
      selectedUnits.current.length === unitList.length &&
      formData.selectedUnits.length !== unitList.length
    ) {
      // If the user has unchecked some of the unit checkboxes.
      void setFieldsValues.current("selectAll", false);
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

  const onSetup = (setFieldValue: SetFieldValue<AppFormData>): void => {
    setFieldsValues.current = setFieldValue;
  };

  return (
    <>
      <div className="entity-details__sidebar">
        <InfoPanel />
        {canConfigureModel ? (
          <div className="entity-details__actions">
            <Button
              className="entity-details__action-button"
              onClick={showConfig}
            >
              <Icon name="settings" />
              {Label.CONFIGURE}
            </Button>
          </div>
        ) : null}
        <EntityInfo data={appEntityData} />
      </div>
      <div className="entity-details__main">
        {!hideMachines && (
          <SegmentedControl
            buttons={["Units", "Machines"].map((tab) => ({
              children: tab,
              key: tab.toLowerCase(),
              to:
                qualifier && modelName && entity
                  ? urls.model.app.tab({
                      qualifier,
                      modelName,
                      appName: entity,
                      tab: tab.toLowerCase() as AppTab,
                    })
                  : "",
            }))}
            buttonComponent={Link}
            className="u-sv2"
            activeButton={query.tableView}
          />
        )}
        <div ref={tablesRef}>
          {query.tableView === "units" && (
            <>
              <ChipGroup chips={unitChipData} descriptor="units" />
              <div className="entity-details__action-button-row">
                {canConfigureModel ? (
                  <>
                    <Button
                      appearance="base"
                      className="entity-details__action-button"
                      hasIcon={true}
                      onClick={(event: React.MouseEvent) => {
                        event.stopPropagation();
                        showActions();
                      }}
                      disabled={!enableActionButtonRow}
                      {...testId(TestId.RUN_ACTION_BUTTON)}
                    >
                      <Icon name="run-action" />
                      <span>{Label.RUN_ACTION}</span>
                    </Button>
                    <span className="entity-details__action-button-divider"></span>
                  </>
                ) : null}
                <Button
                  element={Link}
                  appearance="base"
                  className="entity-details__action-button"
                  hasIcon={true}
                  {...testId(TestId.SHOW_LOGS)}
                  to={
                    qualifier && modelName
                      ? urls.model.tab({
                          qualifier,
                          modelName,
                          tab: ModelTab.LOGS,
                        })
                      : ""
                  }
                >
                  <Icon name="logs" />
                  <span>{Label.VIEW_LOGS}</span>
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
                    className={classNames(
                      "entity-details__units p-main-table",
                      {
                        "has-checkbox": canConfigureModel,
                      },
                    )}
                    sortable
                    emptyStateMsg={Label.NO_UNITS}
                    {...testId(TestId.UNITS_TABLE)}
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
                className="entity-details__machines p-main-table"
                sortable
                emptyStateMsg="There are no machines in this model"
                {...testId(TestId.MACHINES_TABLE)}
              />
            </>
          )}
        </div>
      </div>
    </>
  );
}
