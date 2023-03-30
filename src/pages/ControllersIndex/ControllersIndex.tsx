import { Icon, MainTable, Tooltip } from "@canonical/react-components";
import {
  MainTableCell,
  MainTableHeader,
} from "@canonical/react-components/dist/components/MainTable/MainTable";
import FadeIn from "animations/FadeIn";
import cloneDeep from "clone-deep";
import Header from "components/Header/Header";
import { useQueryParams } from "hooks/useQueryParams";
import useWindowTitle from "hooks/useWindowTitle";
import BaseLayout from "layout/BaseLayout/BaseLayout";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { getControllerData, getModelData } from "store/juju/selectors";
import { AdditionalController, Controller } from "store/juju/types";
import ControllersOverview from "./ControllerOverview/ControllerOverview";
import "./_controllers.scss";

type AnnotatedController = (Controller | AdditionalController) & {
  models: number;
  machines: number;
  applications: number;
  units: number;
  wsControllerURL: string;
};

function Details() {
  useWindowTitle("Controllers");
  const controllerData = useSelector(getControllerData);
  const modelData = useSelector(getModelData);

  const controllerMap: Record<string, AnnotatedController> = {};
  const additionalControllers: string[] = [];
  if (controllerData) {
    Object.entries(controllerData).forEach(
      ([wsControllerURL, controllers], i) => {
        controllers.forEach((controller) => {
          const id =
            "uuid" in controller ? controller.uuid : `${wsControllerURL}-${i}`;
          if (controller.additionalController) {
            additionalControllers.push(id);
          }
          controllerMap[id] = {
            ...controller,
            models: 0,
            machines: 0,
            applications: 0,
            units: 0,
            wsControllerURL,
          };
        });
      }
    );
    if (modelData) {
      for (const modelUUID in modelData) {
        const model = modelData[modelUUID];
        if (model.info) {
          const controllerUUID = model?.info["controller-uuid"];
          if (controllerMap[controllerUUID]) {
            controllerMap[controllerUUID].models += 1;
            controllerMap[controllerUUID].machines += Object.keys(
              model?.machines
            ).length;
            const applicationKeys = Object.keys(model.applications);
            controllerMap[controllerUUID].applications +=
              applicationKeys.length;
            const unitCount = applicationKeys.reduce((acc, appName) => {
              const units = model.applications[appName].units || {}; // Subordinates don't have units
              return acc + Object.keys(units).length;
            }, 0);
            controllerMap[controllerUUID].units += unitCount;
          }
        }
      }
    }
  }

  const headers: MainTableHeader[] = [
    { content: "default", sortKey: "name" },
    { content: "cloud/region", sortKey: "cloud/region" },
    { content: "models", sortKey: "models" },
    { content: "machines", sortKey: "machines" },
    {
      content: "applications",
      sortKey: "applications",
    },
    { content: "units", sortKey: "units" },
    { content: "version", sortKey: "version" },
    { content: "access", sortKey: "public" },
  ];

  const additionalHeaders = cloneDeep(headers);
  additionalHeaders[0].content = (
    <span>
      Registered
      <span
        className="controllers--registered-tooltip p-icon--help"
        title="The controller authentication data is only stored in your browser localStorage. If you'd like this to persist across browsers try JAAS"
      ></span>
    </span>
  );

  function generatePathValue(controllerData: AnnotatedController) {
    const column: MainTableCell = { content: "" };
    if ("path" in controllerData && controllerData?.path === "admin/jaas") {
      column.content = "JAAS";
    } else if ("path" in controllerData && controllerData.path) {
      column.content = controllerData.path;
    } else {
      column.content = controllerData?.wsControllerURL;
      column.className = "is-disconnected";
      column.title = "disconnected";
    }
    return column;
  }

  function generateRow(c: AnnotatedController) {
    const cloud =
      "location" in c && c?.location?.cloud ? c.location.cloud : "unknown";
    const region =
      "location" in c && c?.location?.region ? c.location.region : "unknown";
    const cloudRegion = `${cloud}/${region}`;
    const access = "Public" in c && c.Public ? "Public" : "Private";
    let columns = [
      generatePathValue(c),
      { content: cloudRegion },
      { content: c.models },
      { content: c.machines },
      { content: c.applications },
      { content: c.units },
      { content: "" },
      { content: access, className: "u-capitalise" },
    ];
    if ("version" in c && c.version) {
      columns[columns.length - 2] = {
        content: (
          <>
            {c.version}{" "}
            {c.updateAvailable ? (
              <Tooltip
                message={
                  <>
                    There is an update or migration available for this
                    controller.{" "}
                    <a
                      className="p-list__link"
                      href="https://juju.is/docs/olm/upgrading"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Read more
                    </a>
                  </>
                }
              >
                <Icon name="warning" data-testid="update-available" />
              </Tooltip>
            ) : null}
          </>
        ),
      };
    }
    return {
      columns,
    };
  }
  // XXX this isn't a great way of doing this.
  const additionalRows = additionalControllers.map((uuid) => {
    const row = generateRow(controllerMap[uuid]);
    delete controllerMap[uuid];
    return row;
  });

  const rows = controllerMap && Object.values(controllerMap).map(generateRow);

  const [, setPanelQs] = useQueryParams<{ panel: string | null }>({
    panel: null,
  });

  return (
    <>
      <div className="controllers--header">
        <div className="controllers__heading">
          Model status across controllers
        </div>
        <div className="controllers--register">
          <button
            className="p-button--positive"
            onClick={() => setPanelQs({ panel: "register-controller" })}
          >
            Register a controller
          </button>
        </div>
      </div>
      <ControllersOverview />
      <div className="l-controllers-table u-overflow--auto">
        {rows.length > 0 && <MainTable headers={headers} rows={rows} />}
        {additionalRows.length > 0 && (
          <MainTable headers={additionalHeaders} rows={additionalRows} />
        )}
      </div>
    </>
  );
}

export default function ControllersIndex() {
  const controllerData = useSelector(getControllerData);
  let controllerCount = 0;
  if (controllerData) {
    controllerCount = Object.keys(controllerData).length;
  }
  const modelData = useSelector(getModelData);
  let modelCount = 0;
  if (modelData) {
    modelCount = Object.keys(modelData).length;
  }

  return (
    <BaseLayout>
      <Header>
        <div className="entity-details__header">
          <strong className="controllers--count">
            {controllerCount} controllers,{" "}
            <Link to="/models">{modelCount} models</Link>
          </strong>
        </div>
      </Header>
      <div className="l-content controllers">
        <FadeIn isActive={true}>
          <Details />
        </FadeIn>
      </div>
    </BaseLayout>
  );
}
