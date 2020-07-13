import React, { useState } from "react";
import { useSelector } from "react-redux";

import Layout from "components/Layout/Layout";
import Header from "components/Header/Header";
import SlidePanel from "components/SlidePanel/SlidePanel";
import MainTable from "@canonical/react-components/dist/components/MainTable/MainTable";

import { getControllerData, getModelData } from "app/selectors";
import useLocalStorage from "hooks/useLocalStorage";
import ControllersOverview from "./ControllerOverview/ControllerOverview";

import "./_controllers.scss";

function Details() {
  const controllerData = useSelector(getControllerData);
  const modelData = useSelector(getModelData);

  const [showRegisterAController, setShowRegisterAController] = useState(false);
  const [showConfirmRegister, setShowConfirmRegister] = useState(false);

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
        };
      });
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
    { content: "name", sortKey: "name" },
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

  function generateRow(c) {
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
  }

  // XXX this isn't a great way of doing this.
  const additionalRows = additionalControllers.map((uuid) => {
    const row = generateRow(controllerMap[uuid]);
    delete controllerMap[uuid];
    return row;
  });

  const rows = controllerMap && Object.values(controllerMap).map(generateRow);

  return (
    <>
      <div className="register-a-controller">
        <button
          className="p-button--positive"
          onClick={() => {
            setShowRegisterAController(!showRegisterAController);
          }}
        >
          Register a Controller
        </button>
      </div>
      <ControllersOverview />
      <div className="l-controllers-table u-overflow--scroll">
        <h5>Default Controllers</h5>
        <MainTable headers={headers} rows={rows} />
        <h5>Registered Controllers</h5>
        <span className="p-form-help-text">
          These controllers will only be available on this browser{" "}
          <span
            className="controllers--registered-tooltip"
            title="The controller authentication data is only stored in your browser localstorage. If you'd like this to persist across browsers try JAAS"
          >
            [?]
          </span>
        </span>
        <MainTable headers={headers} rows={additionalRows} />
        {showRegisterAController ? (
          <RegisterAController
            onClose={() => setShowRegisterAController(false)}
            showConfirmRegister={showConfirmRegister}
            setShowConfirmRegister={setShowConfirmRegister}
          />
        ) : null}
      </div>
    </>
  );
}

function RegisterAController({
  onClose,
  showConfirmRegister,
  setShowConfirmRegister,
}) {
  const [formValues, setFormValues] = useState({});
  const [additionalControllers, setAdditionalControllers] = useLocalStorage(
    "additionalControllers",
    []
  );

  function moveToConfirm(e) {
    e.preventDefault();
    // XXX Validate form values
    setShowConfirmRegister(true);
  }

  function handleRegisterAController() {
    additionalControllers.push([
      formValues.wsControllerURL, // wsControllerURL
      { user: formValues.username, password: formValues.password }, // credentials
      null, // bakery
      formValues.identityProviderAvailable, // identityProviderAvailable
      true, // additional controller
    ]);
    setAdditionalControllers(additionalControllers);
    onClose(); // Close the SlidePanel
  }

  function handleInputChange(e) {
    formValues[e.target.name] = e.target.checked || e.target.value;
    setFormValues(formValues);
  }

  const controllerIP = formValues?.wsControllerURL
    ? formValues.wsControllerURL.replace("wss://", "").replace("/api", "")
    : "";
  const dashboardLink = `https://${controllerIP}/dashboard`;

  /* eslint-disable jsx-a11y/label-has-associated-control */
  return (
    <SlidePanel onClose={onClose}>
      <h5>Register a Controller</h5>
      {!showConfirmRegister ? (
        <form className="p-form p-form--stacked" onSubmit={moveToConfirm}>
          <div className="p-form__group row">
            <div className="col-4">
              <label htmlFor="full-name-stacked" className="p-form__label">
                Controller name
              </label>
            </div>

            <div className="col-8">
              <div className="p-form__control">
                <input
                  type="text"
                  id="full-name-stacked"
                  name="controllerName"
                  onChange={handleInputChange}
                  required=""
                />
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
                <input
                  type="text"
                  id="full-name-stacked"
                  name="wsControllerURL"
                  onChange={handleInputChange}
                  required=""
                />
                <p className="p-form-help-text">
                  wss://123.456.789.0:17070/api
                </p>
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
                <input
                  type="text"
                  id="full-name-stacked"
                  name="username"
                  onChange={handleInputChange}
                  required=""
                />
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
                <input
                  type="password"
                  id="full-name-stacked"
                  name="password"
                  onChange={handleInputChange}
                  required=""
                />
                <p className="p-form-help-text">
                  Stored locally in your browser.
                </p>
              </div>
            </div>
          </div>

          <div className="p-form__group row">
            <div className="col-4">
              <label
                htmlFor="identityProviderAvailable"
                className="p-form__label"
              >
                Identity Provider
              </label>
            </div>

            <div className="col-8">
              <label>
                <input
                  type="checkbox"
                  id="identityProviderAvailable"
                  name="identityProvider"
                  defaultChecked={false}
                  onChange={handleInputChange}
                  required=""
                />
              </label>

              <p className="p-form-help-text">
                If you provided a username and password this should be left
                unchecked.
              </p>
            </div>
          </div>

          <div className="row">
            <div className="col-12">
              <button
                className="p-button--positive u-float-right"
                type="submit"
              >
                Next Step
              </button>
            </div>
          </div>
        </form>
      ) : (
        <form onSubmit={handleRegisterAController}>
          <span>
            Visit{" "}
            <a href={dashboardLink} target="_blank" rel="noreferrer">
              {dashboardLink}
            </a>{" "}
            to accept the certificate on this controller to enable a secure
            connection
          </span>
          <div className="col-8">
            <label>
              <input
                type="checkbox"
                id="identityProviderAvailable"
                name="identityProvider"
                defaultChecked={false}
                onChange={handleInputChange}
                required=""
              />
            </label>

            <p className="p-form-help-text">
              The certificate, if any, has been accepted.
            </p>
          </div>
          <div className="row">
            <div className="col-12">
              <button
                className="p-button--positive u-float-right"
                type="submit"
              >
                Add Controller
              </button>
            </div>
          </div>
        </form>
      )}
    </SlidePanel>
  );
  /* eslint-enable jsx-a11y/label-has-associated-control */
}

export default function Controllers() {
  return (
    <Layout>
      <Header></Header>
      <div className="l-content controllers">
        <Details />
      </div>
    </Layout>
  );
}
