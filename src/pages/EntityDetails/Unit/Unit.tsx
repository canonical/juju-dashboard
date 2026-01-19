import type {
  ApplicationStatus,
  MachineStatus,
} from "@canonical/jujulib/dist/api/facades/client/ClientV7";
import { MainTable } from "@canonical/react-components";
import type { JSX } from "react";
import { useMemo } from "react";
import { Link, useParams } from "react-router";

import EntityInfo from "components/EntityInfo";
import InfoPanel from "components/InfoPanel";
import NotFound from "components/NotFound";
import type { EntityDetailsRoute } from "components/Routes";
import {
  getAllModelApplicationStatus,
  getModelApplications,
  getModelMachines,
  getModelUnits,
  getModelUUIDFromList,
  isKubernetesModel,
} from "store/juju/selectors";
import { extractRevisionNumber } from "store/juju/utils/models";
import { useAppSelector } from "store/store";
import {
  generateLocalApplicationTableHeaders,
  machineTableHeaders,
} from "tables/tableHeaders";
import {
  generateLocalApplicationRows,
  generateMachineRows,
} from "tables/tableRows";
import urls, { externalURLs } from "urls";

import { Label } from "./types";

export default function Unit(): JSX.Element {
  const {
    modelName = null,
    userName = null,
    unitId = null,
    appName = null,
  } = useParams<EntityDetailsRoute>();
  // The unit name might have a dash in it so we need to grab only the last one
  // ex) content-cache-0.
  const unitIdentifier = unitId?.replace(/-(\d+)$/, "/$1");

  const modelUUID = useAppSelector((state) =>
    getModelUUIDFromList(state, modelName, userName),
  );
  const applications = useAppSelector((state) =>
    getModelApplications(state, modelUUID),
  );
  const units = useAppSelector((state) => getModelUnits(state, modelUUID));
  const machines = useAppSelector((state) =>
    getModelMachines(state, modelUUID),
  );
  const isK8s = useAppSelector((state) => isKubernetesModel(state, modelUUID));

  const unit = unitIdentifier && units?.[unitIdentifier];

  const filteredMachineList = useMemo(() => {
    const filteredMachines: Record<string, MachineStatus> = {};
    if (machines && unit) {
      const machineId = unit["machine-id"];
      filteredMachines[machineId] = machines[machineId];
    }
    return filteredMachines;
  }, [machines, unit]);

  const filteredApplicationList = useMemo(() => {
    const filteredApps: Record<string, ApplicationStatus> = {};
    if (applications && unit) {
      const name = unit.application;
      filteredApps[name] = applications[name];
    }
    return filteredApps;
  }, [applications, unit]);

  const applicationStatuses = useAppSelector((state) =>
    getAllModelApplicationStatus(state, modelUUID),
  );

  const machineRows = useMemo(
    () =>
      modelName && userName
        ? generateMachineRows(filteredMachineList, units, {
            modelName,
            userName,
          })
        : [],
    [filteredMachineList, units, modelName, userName],
  );

  const applicationRows = useMemo(
    () =>
      modelName && userName
        ? generateLocalApplicationRows(
            filteredApplicationList,
            applicationStatuses,
            { modelName, userName },
          )
        : [],
    [filteredApplicationList, applicationStatuses, modelName, userName],
  );

  if (!unit) {
    return (
      <div className="full-width row">
        <NotFound message={Label.NOT_FOUND}>
          <>
            <p>
              Could not find a unit with ID "{unitId}" for the user "{userName}
              ". If this is a model that belongs to another user then check that
              you have been{" "}
              <a href={externalURLs.manageAccess}>granted access</a>.
            </p>
            <p>
              <Link
                to={urls.model.app.index({
                  userName: userName ?? "",
                  modelName: modelName ?? "",
                  appName: appName ?? "",
                })}
              >
                {Label.VIEW_ALL_UNITS}
              </Link>
            </p>
          </>
        </NotFound>
      </div>
    );
  }

  const charm = unit?.["charm-url"] || "-";
  const unitEntityData = {
    charm,
    os: "-",
    revision: extractRevisionNumber(charm) || "-",
    version: unit?.["workload-status"].version || "-",
    message: unit?.["workload-status"].message || "-",
  };

  return (
    <>
      <div>
        <InfoPanel />
        <EntityInfo data={unitEntityData} />
      </div>
      <div className="entity-details__main">
        {!isK8s && (
          <MainTable
            headers={machineTableHeaders}
            rows={machineRows}
            className="entity-details__machines p-main-table"
            sortable
            emptyStateMsg={"There are no machines in this model"}
          />
        )}
        <MainTable
          headers={generateLocalApplicationTableHeaders(false)}
          rows={applicationRows}
          className="entity-details__apps p-main-table"
          sortable
          emptyStateMsg={"There are no apps in this model"}
        />
      </div>
    </>
  );
}
