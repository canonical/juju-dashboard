import React, { useState } from "react";
import { useSelector } from "react-redux";
import cloneDeep from "clone-deep";

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
        title="The controller authentication data is only stored in your browser localstorage. If you'd like this to persist across browsers try JAAS"
      ></span>
    </span>
  );

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
      <div className="controllers--header">
        <div className="controllers__heading">
          Model status across controllers
        </div>
        <div className="controllers--register">
          <button
            className="p-button--positive"
            onClick={() => {
              setShowRegisterAController(!showRegisterAController);
            }}
          >
            Register a controller
          </button>
        </div>
      </div>
      <ControllersOverview />
      <div className="l-controllers-table u-overflow--scroll">
        <MainTable headers={headers} rows={rows} />
        {/* {additionalRows.length ? ( */}
        <MainTable headers={additionalHeaders} rows={additionalRows} />
        {/* ) : null} */}
        {showRegisterAController ? (
          <RegisterAController
            onClose={() => setShowRegisterAController(false)}
          />
        ) : null}
      </div>
    </>
  );
}

function RegisterAController({ onClose }) {
  const [formValues, setFormValues] = useState({});
  const [additionalControllers, setAdditionalControllers] = useLocalStorage(
    "additionalControllers",
    []
  );

  function handleRegisterAController(e) {
    e.preventDefault();
    // XXX Validate form values
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
    const newFormValues = { ...formValues };
    newFormValues[e.target.name] =
      e.target.type === "checkbox" ? e.target.checked : e.target.value;
    setFormValues(newFormValues);
  }

  const controllerIP = formValues?.wsControllerURL
    ? formValues.wsControllerURL.replace("wss://", "").replace("/api", "")
    : "";
  const dashboardLink = `https://${controllerIP}/dashboard`;
  /* eslint-disable jsx-a11y/label-has-associated-control */
  return (
    <SlidePanel onClose={onClose}>
      <h5>Register a Controller</h5>
      <p className="p-form-help-text">
        Controller information can be retrieved using the{" "}
        <code>juju show-controller</code>
        command.
      </p>
      <form
        className="p-form p-form--stacked"
        onSubmit={handleRegisterAController}
      >
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
                required="true"
              />
              <p className="p-form-help-text">
                Must be a valid alpha-numeric Juju controller name. <br />
                e.g. production-controller-aws
              </p>
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
                required="true"
              />
              <p className="p-form-help-text">
                You'll typically want to use the public IP address for the
                controller. <br />
                e.g. wss://123.456.789.0:17070/api
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
                The username you use to access the controller.
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
                The password will be what you used when running{" "}
                <code>juju register</code>
                or if unchanged from the default it can be retrieved by running{" "}
                <code>juju dashboard</code>.
              </p>
            </div>
          </div>
        </div>

        <div className="p-form__group row">
          <div className="col-8 col-start-large-5">
            <input
              type="checkbox"
              id="identityProviderAvailable"
              name="identityProvider"
              defaultChecked={false}
              onChange={handleInputChange}
              required=""
            />
            <label htmlFor="identityProviderAvailable">
              An identity provider is available.{" "}
            </label>
            <div className="p-form-help-text identity-provider">
              If you provided a username and password this should be left
              unchecked.
            </div>
          </div>
        </div>
        <div className="row">
          <div className="col-8 col-start-large-5">
            <i className="p-icon--warning"></i>
            <div className="controller-link-message">
              Visit{" "}
              <a href={dashboardLink} target="_blank" rel="noopener noreferrer">
                the controller
              </a>{" "}
              to accept the certificate on this controller to enable a secure
              connection
            </div>
          </div>
        </div>
        <div className="row horizontal-rule">
          <div className="col-8 col-start-large-5">
            <input
              type="checkbox"
              id="certificateHasBeenAccepted"
              name="certificateAccepted"
              defaultChecked={false}
              onChange={handleInputChange}
              required="true"
            />
            <label htmlFor="certificateHasBeenAccepted">
              The SSL certificate, if any, has been accepted.
            </label>
          </div>
        </div>
        <div className="row register-a-controller__submit-segment push-1-rem">
          <div className="col-12">
            <button
              className="p-button--positive u-float-right"
              type="submit"
              disabled={!formValues.certificateAccepted}
            >
              Add Controller
            </button>
            <p className="p-form-help-text">
              The credentials are stored locally in your browser and can be
              cleared on log-out.
            </p>
          </div>
        </div>
      </form>
    </SlidePanel>
  );
  /* eslint-enable jsx-a11y/label-has-associated-control */
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
          <a href="/models">{modelCount} models</a>
        </div>
      </Header>
      <div className="l-content controllers">
        <Details />
      </div>
    </Layout>
  );
}
