import { useState } from "react";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import cloneDeep from "clone-deep";

import Layout from "components/Layout/Layout";
import Header from "components/Header/Header";
import SlidePanel from "components/SlidePanel/SlidePanel";
import MainTable from "@canonical/react-components/dist/components/MainTable/MainTable";

import FadeIn from "animations/FadeIn";

import useWindowTitle from "hooks/useWindowTitle";

import { getControllerData, getModelData } from "app/selectors";

import { useQueryParam, StringParam } from "use-query-params";

import ControllersOverview from "./ControllerOverview/ControllerOverview";

import "./_controllers.scss";

function Details() {
  useWindowTitle("Controllers");
  const controllerData = useSelector(getControllerData);
  const modelData = useSelector(getModelData);
  const [showRegisterAController, setShowRegisterAController] = useState(false);

  const controllerMap = {};
  const additionalControllers = [];
  if (controllerData) {
    Object.entries(controllerData).forEach((controllerData) => {
      controllerData[1].forEach((controller) => {
        if (controller.additionalController) {
          additionalControllers.push(controller.uuid);
        }
        controllerMap[controller.uuid] = {
          ...controller,
          models: 0,
          machines: 0,
          applications: 0,
          units: 0,
          wsControllerURL: controllerData[0],
        };
      });
    });
    if (modelData) {
      for (const modelUUID in modelData) {
        const model = modelData[modelUUID];
        if (model.info) {
          const controllerUUID = model.info["controller-uuid"];
          if (controllerMap[controllerUUID]) {
            controllerMap[controllerUUID].models += 1;
            controllerMap[controllerUUID].machines += Object.keys(
              model.machines
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

  const headers = [
    { content: "Default", sortKey: "name" },
    { content: "cloud/region", sortKey: "cloud/region" },
    { content: "models", sortKey: "models", className: "u-align--right" },
    { content: "machines", sortKey: "machines", className: "u-align--right" },
    {
      content: "applications",
      sortKey: "applications",
      className: "u-align--right",
    },
    { content: "units", sortKey: "units", className: "u-align--right" },
    { content: "version", sortKey: "version", className: "u-align--right" },
    { content: "public", sortKey: "public", className: "u-align--right" },
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

  function generatePathValue(controllerData) {
    const column = { content: "" };
    if (controllerData?.path === "admin/jaas") {
      column.content = "JAAS";
    } else if (controllerData?.path) {
      column.content = controllerData.path;
    } else {
      column.content = controllerData?.wsControllerURL;
      column.className = "is-disconnected";
      column.title = "disconnected";
    }
    return column;
  }

  function generateRow(c) {
    const cloud = c?.location?.cloud || "unknown";
    const region = c?.location?.region || "unknown";
    const cloudRegion = `${cloud}/${region}`;
    const publicAccess = `${c?.Public}` || "False";

    return {
      columns: [
        generatePathValue(c),
        { content: cloudRegion },
        { content: c.models, className: "u-align--right" },
        { content: c.machines, className: "u-align--right" },
        { content: c.applications, className: "u-align--right" },
        { content: c.units, className: "u-align--right" },
        { content: c.version, className: "u-align--right" },
        { content: publicAccess, className: "u-align--right u-capitalise" },
      ],
    };
  }

  // XXX this isn't a great way of doing this.
  const additionalRows = additionalControllers.map((uuid) => {
    const row = generateRow(controllerMap[uuid]);
    delete controllerMap[uuid];
    return row;
  });

  const rows = controllerMap && Object.values(controllerMap).map(generateRow);

  const setPanelQs = useQueryParam("panel", StringParam)[1];

  return (
    <>
      <div className="controllers--header">
        <div className="controllers__heading">
          Model status across controllers
        </div>
        <div className="controllers--register">
          <button
            className="p-button--positive"
            onClick={() => setPanelQs("register-controller")}
          >
            Register a controller
          </button>
        </div>
      </div>
      <ControllersOverview />
      <div className="l-controllers-table u-overflow--scroll">
        {rows.length > 0 && <MainTable headers={headers} rows={rows} />}
        {additionalRows.length > 0 && (
          <MainTable headers={additionalHeaders} rows={additionalRows} />
        )}
        <RegisterAController
          onClose={() => setShowRegisterAController(false)}
          showRegisterAController={showRegisterAController}
        />
      </div>
    </>
  );
}

function RegisterAController({ onClose, showRegisterAController }) {
  return (
    <SlidePanel
      onClose={onClose}
      isActive={showRegisterAController}
      className="register-a-controller__slide-panel"
    ></SlidePanel>
  );
}

export default function Controllers() {
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
    <Layout>
      <Header>
        <div className="controllers--count">
          {controllerCount} controllers,{" "}
          <Link to="/models">{modelCount} models</Link>
        </div>
      </Header>
      <div className="l-content controllers">
        <FadeIn isActive={true}>
          <Details />
        </FadeIn>
      </div>
    </Layout>
  );
}
