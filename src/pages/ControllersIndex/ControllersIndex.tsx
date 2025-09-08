import {
  Icon,
  MainTable,
  Notification,
  Tooltip,
} from "@canonical/react-components";
import type {
  MainTableCell,
  MainTableHeader,
} from "@canonical/react-components/dist/components/MainTable/MainTable";
import { Link } from "react-router";

import AuthenticationButton from "components/AuthenticationButton";
import Status from "components/Status";
import TruncatedTooltip from "components/TruncatedTooltip";
import useWindowTitle from "hooks/useWindowTitle";
import MainContent from "layout/MainContent";
import {
  getControllerConnections,
  getLoginErrors,
  getVisitURLs,
} from "store/general/selectors";
import {
  getControllersCount,
  getControllerData,
  getModelData,
} from "store/juju/selectors";
import type { Controller } from "store/juju/types";
import { useAppSelector } from "store/store";
import urls, { externalURLs } from "urls";
import { breakLines } from "utils";

import ControllersOverview from "./ControllerOverview";
import { Label, TestId } from "./types";

type AnnotatedController = Controller & {
  models: number;
  machines: number;
  applications: number;
  units: number;
  wsControllerURL: string;
};

const ControllersIndex = () => {
  const controllersCount = useAppSelector(getControllersCount);
  const modelData = useAppSelector(getModelData);
  let modelCount = 0;
  if (modelData) {
    modelCount = Object.keys(modelData).length;
  }

  useWindowTitle("Controllers");
  const controllerConnections = useAppSelector(getControllerConnections);
  const controllerData = useAppSelector(getControllerData);
  const loginErrors = useAppSelector(getLoginErrors);
  const visitURLs = useAppSelector(getVisitURLs);

  const controllerMap: Record<string, AnnotatedController> = {};
  if (controllerData) {
    Object.entries(controllerData).forEach(([wsControllerURL, controllers]) => {
      controllers.forEach((controller) => {
        const id = "uuid" in controller ? controller.uuid : wsControllerURL;
        controllerMap[id] = {
          ...controller,
          models: 0,
          machines: 0,
          applications: 0,
          units: 0,
          wsControllerURL,
        };
      });
    });
    if (modelData) {
      for (const modelUUID in modelData) {
        const model = modelData[modelUUID];
        if (model.info) {
          const controllerUUID = model?.info["controller-uuid"];
          if (controllerMap[controllerUUID]) {
            controllerMap[controllerUUID].models += 1;
            controllerMap[controllerUUID].machines += Object.keys(
              model?.machines,
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
    {
      content: <>{Label.DEFAULT}</>,
      heading: Label.NAME,
      sortKey: "name",
    },
    {
      className: "p-table__cell--icon-placeholder",
      content: "status",
      sortKey: "status",
    },
    { content: "cloud/region", sortKey: "cloud/region" },
    { content: "models", sortKey: "models" },
    { content: "machines", sortKey: "machines" },
    {
      content: "applications",
      sortKey: "applications",
    },
    { content: "units", sortKey: "units" },
    { content: "version", sortKey: "version" },
  ];

  const generatePathValue = (annotatedController: AnnotatedController) => {
    const column: MainTableCell = { content: "" };
    // Remove protocol and trailing /api from websocket addresses.
    const controllerAddress = annotatedController.wsControllerURL
      .replace(/^wss?:\/\//i, "")
      .replace(/\/api$/i, "");
    if ("name" in annotatedController && annotatedController.name) {
      column.content = (
        <Tooltip
          message={controllerAddress}
          positionElementClassName="truncated-tooltip__position-element"
        >
          {annotatedController.name}
        </Tooltip>
      );
    } else if ("path" in annotatedController && annotatedController.path) {
      column.content = (
        <Tooltip
          message={controllerAddress}
          positionElementClassName="truncated-tooltip__position-element"
        >
          {annotatedController.path}
        </Tooltip>
      );
    } else {
      column.content = (
        <TruncatedTooltip
          message={controllerAddress}
          positionElementClassName="u-text--muted"
        >
          {controllerAddress}
        </TruncatedTooltip>
      );
    }
    return column;
  };

  const generateRow = (
    controller: AnnotatedController,
    authenticated: boolean,
  ) => {
    let cloud = "unknown";
    if ("cloud-tag" in controller && controller["cloud-tag"]) {
      cloud = controller["cloud-tag"];
    } else if ("location" in controller && controller.location?.cloud) {
      cloud = controller.location.cloud;
    }
    let region = "unknown";
    if ("cloud-region" in controller && controller["cloud-region"]) {
      region = controller["cloud-region"];
    } else if ("location" in controller && controller.location?.region) {
      region = controller.location.region;
    }
    const cloudRegion = `${cloud}/${region}`;
    const loginError = loginErrors?.[controller.wsControllerURL];
    let status = "Connected";
    let label = null;
    if (loginError) {
      status = "Error";
      label = "Failed to connect";
    } else if (!authenticated) {
      status = "caution";
      label = "Authentication required";
    }
    const columns = [
      generatePathValue(controller),
      {
        content: (
          <Tooltip
            message={breakLines(loginError)}
            positionElementClassName="controllers__status"
            tooltipClassName="p-tooltip--fixed-width"
          >
            <Status className="u-truncate controllers__status" status={status}>
              {label}
            </Status>
          </Tooltip>
        ),
      },
      { content: cloudRegion },
      { content: controller.models },
      { content: controller.machines },
      { content: controller.applications },
      { content: controller.units },
      { content: "" },
    ];
    const version =
      ("agent-version" in controller && controller["agent-version"]) ||
      ("version" in controller && controller.version);
    if (version) {
      columns[columns.length - 1] = {
        content: (
          <>
            {version}{" "}
            {controller.updateAvailable ? (
              <Tooltip
                message={
                  <>
                    There is an update or migration available for this
                    controller.{" "}
                    <a
                      className="p-list__link"
                      href={externalURLs.upgradingThings}
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
  };

  const rows =
    controllerMap &&
    Object.values(controllerMap).map((controller) =>
      generateRow(
        controller,
        !!controllerConnections &&
          controller.wsControllerURL in controllerConnections,
      ),
    );

  return (
    <MainContent
      data-testid={TestId.COMPONENT}
      title={
        <>
          {controllersCount} controllers,{" "}
          <Link to={urls.models.index}>{modelCount} models</Link>
        </>
      }
    >
      <div className="controllers">
        {visitURLs?.map((visitURL) => (
          <Notification severity="caution" key={visitURL}>
            Controller authentication required.{" "}
            <AuthenticationButton appearance="link" visitURL={visitURL}>
              Authenticate
            </AuthenticationButton>
            .
          </Notification>
        ))}
        <div className="controllers--header">
          <div className="controllers__heading">
            Model status across controllers
          </div>
        </div>
        <ControllersOverview />
        <div className="l-controllers-table">
          {rows.length > 0 && (
            <>
              <h5 className="u-hide--large">{Label.DEFAULT}</h5>
              <MainTable headers={headers} responsive rows={rows} />
            </>
          )}
        </div>
      </div>
    </MainContent>
  );
};

export default ControllersIndex;
