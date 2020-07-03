import React from "react";
import { useSelector } from "react-redux";

import Layout from "components/Layout/Layout";
import Header from "components/Header/Header";
import Notification from "@canonical/react-components/dist/components/Notification/Notification";
import MainTable from "@canonical/react-components/dist/components/MainTable/MainTable";

import {
  getControllerConnection,
  getControllerData,
  getModelData,
} from "app/selectors";
import ControllersOverview from "./ControllerOverview/ControllerOverview";

import { userIsControllerAdmin } from "../../app/utils";

import "./_controllers.scss";

function Details() {
  const controllerData = useSelector(getControllerData);
  const modelData = useSelector(getModelData);

  const controllerMap = {};
  if (controllerData) {
    controllerData.forEach((controller) => {
      controllerMap[controller.uuid] = {
        ...controller,
        models: 0,
        machines: 0,
        applications: 0,
        units: 0,
      };
    });
    if (modelData) {
      for (const modelUUID in modelData) {
        const model = modelData[modelUUID];
        if (model.info) {
          const controllerUUID = model.info.controllerUuid;
          if (controllerMap[controllerUUID]) {
            controllerMap[controllerUUID].models += 1;
            controllerMap[controllerUUID].machines += Object.keys(
              model.machines
            ).length;
            const applicationKeys = Object.keys(model.applications);
            controllerMap[controllerUUID].applications +=
              applicationKeys.length;
            const unitCount = applicationKeys.reduce((acc, appName) => {
              return (
                acc + Object.keys(model.applications[appName].units).length
              );
            }, 0);
            controllerMap[controllerUUID].units += unitCount;
          }
        }
      }
    }
  }

  const headers = [
    { content: "running", sortKey: "running" },
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

  const rows =
    controllerMap &&
    Object.values(controllerMap).map((c) => {
      const cloud = c?.location?.cloud || "unknown";
      const region = c?.location?.region || "unknown";
      const cloudRegion = `${cloud}/${region}`;
      const publicAccess = c?.Public || "False";
      return {
        columns: [
          { content: c.path },
          { content: cloudRegion },
          { content: c.models, className: "u-align--right" },
          { content: c.machines, className: "u-align--right" },
          { content: c.applications, className: "u-align--right" },
          { content: c.units, className: "u-align--right" },
          { content: c.version, className: "u-align--right" },
          { content: publicAccess, className: "u-align--right u-capitalise" },
        ],
      };
    });

  return (
    <>
      <ControllersOverview />
      <div className="l-controllers-table u-overflow--scroll">
        <h5>Default Controllers</h5>
        <MainTable headers={headers} rows={rows} />
        <h5>Additional Controllers</h5>
        <span className="p-form-help-text">
          These controllers will only be available on this browser
          <span className="small">[?]</span>
        </span>
        <MainTable headers={headers} rows={rows} />
      </div>
    </>
  );
}

function NoAccess() {
  return (
    <Notification type="caution">
      Sorry, you do not have permission to view this page. If you think you
      should have permission, please contact your administrator.
    </Notification>
  );
}

function AddNewController() {
  /* eslint-disable jsx-a11y/label-has-associated-control */
  return (
    <>
      <h5>Add additional Controllers</h5>
      <form
        className="p-form p-form--stacked"
        onSubmit={handleAddingControllers}
      >
        <div className="p-form__group row">
          <div className="col-4">
            <label htmlFor="full-name-stacked" className="p-form__label">
              Controller name
            </label>
          </div>

          <div className="col-8">
            <div className="p-form__control">
              <input type="text" id="full-name-stacked" required="" />
              <p className="p-form-help-text">production-controller-aws</p>
            </div>
          </div>
        </div>

        <div className="p-form__group row">
          <div className="col-4">
            <label htmlFor="full-name-stacked" className="p-form__label">
              Full hostname
            </label>
          </div>

          <div className="col-8">
            <div className="p-form__control">
              <input type="text" id="full-name-stacked" required="" />
              <p className="p-form-help-text">123.456.789.0:17070</p>
            </div>
          </div>
        </div>

        <div className="p-form__group row">
          <div className="col-4">
            <label htmlFor="full-name-stacked" className="p-form__label">
              Username
            </label>
          </div>

          <div className="col-8">
            <div className="p-form__control">
              <input type="text" id="full-name-stacked" required="" />
              <p className="p-form-help-text">
                Stored locally in your browser.
              </p>
            </div>
          </div>
        </div>

        <div className="p-form__group row">
          <div className="col-4">
            <label htmlFor="full-name-stacked" className="p-form__label">
              Password
            </label>
          </div>

          <div className="col-8">
            <div className="p-form__control">
              <input type="text" id="full-name-stacked" required="" />
              <p className="p-form-help-text">
                Stored locally in your browser.
              </p>
            </div>
          </div>
        </div>

        <div className="row">
          <div className="col-12">
            <button className="p-button--positive u-float-right" type="submit">
              Add Controller
            </button>
          </div>
        </div>
      </form>
    </>
  );
  /* eslint-enable jsx-a11y/label-has-associated-control */
}

function handleAddingControllers(e) {
  console.log(e);
}

export default function Controllers() {
  const conn = useSelector(getControllerConnection);
  return (
    <Layout>
      <Header></Header>
      <div className="l-content controllers">
        {/* {userIsControllerAdmin(conn) ? <Details /> : <NoAccess/>} */}
        <Details />
        <div className="controllers__add-new">{AddNewController()}</div>
      </div>
    </Layout>
  );
}
