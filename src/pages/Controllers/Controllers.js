import React, { useState } from "react";
import { useDispatch, useSelector, useStore } from "react-redux";
import { Link } from "react-router-dom";
import cloneDeep from "clone-deep";
import classNames from "classnames";

import Layout from "components/Layout/Layout";
import Header from "components/Header/Header";
import SlidePanel from "components/SlidePanel/SlidePanel";
import MainTable from "@canonical/react-components/dist/components/MainTable/MainTable";

import useLocalStorage from "hooks/useLocalStorage";
import useWindowTitle from "hooks/useWindowTitle";

import { getBakery, getControllerData, getModelData } from "app/selectors";
import { connectAndStartPolling } from "app/actions";
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
        <MainTable headers={additionalHeaders} rows={additionalRows} />
        <RegisterAController
          onClose={() => setShowRegisterAController(false)}
          showRegisterAController={showRegisterAController}
        />
      </div>
    </>
  );
}

function RegisterAController({ onClose, showRegisterAController }) {
  const [formValues, setFormValues] = useState({});
  const dispatch = useDispatch();
  const reduxStore = useStore();
  const bakery = useSelector(getBakery);
  const [additionalControllers, setAdditionalControllers] = useLocalStorage(
    "additionalControllers",
    []
  );

  function handleRegisterAController(e) {
    e.preventDefault();
    // XXX Validate form values
    additionalControllers.push([
      `wss://${formValues.wsControllerHost}/api`, // wsControllerURL
      { user: formValues.username, password: formValues.password }, // credentials
      null, // bakery
      formValues.identityProviderAvailable, // identityProviderAvailable
      true, // additional controller
    ]);
    setAdditionalControllers(additionalControllers);
    dispatch(connectAndStartPolling(reduxStore, bakery));
    onClose(); // Close the SlidePanel
  }

  function handleInputChange(e) {
    const newFormValues = { ...formValues };
    newFormValues[e.target.name] =
      e.target.type === "checkbox" ? e.target.checked : e.target.value;
    setFormValues(newFormValues);
  }

  function generateTheControllerLink(controllerIP) {
    if (!controllerIP) {
      return "the controller";
    }
    const dashboardLink = `https://${controllerIP}/dashboard`;
    return (
      <a href={dashboardLink} target="_blank" rel="noopener noreferrer">
        the controller
      </a>
    );
  }

  return (
    <SlidePanel
      onClose={onClose}
      isActive={showRegisterAController}
      className="register-a-controller__slide-panel"
    >
      <h5>Register a Controller</h5>
      <p className="p-form-help-text">
        Information can be retrieved using the <code>juju show-controller</code>{" "}
        command.
      </p>
      <form
        className="p-form p-form--stacked"
        onSubmit={handleRegisterAController}
      >
        <div className="p-form__group row">
          <div className="col-3">
            <label
              htmlFor="controller-name"
              className="p-form__label is-required"
            >
              Name
            </label>
          </div>

          <div className="col-8">
            <div className="p-form__control">
              <input
                type="text"
                id="controller-name"
                name="controllerName"
                onChange={handleInputChange}
                required={true}
              />
              <p className="p-form-help-text">
                Must be a valid alpha-numeric Juju controller name. <br />
                e.g. production-controller-aws
              </p>
            </div>
          </div>
        </div>

        <div className="p-form__group row">
          <div className="col-3">
            <label htmlFor="host" className="p-form__label is-required">
              Host
            </label>
          </div>

          <div className="col-8">
            <div className="p-form__control">
              <input
                type="text"
                id="host"
                name="wsControllerHost"
                onChange={handleInputChange}
                required={true}
              />
              <p className="p-form-help-text">
                You'll typically want to use the public IP:Port address for the
                controller. <br />
                e.g. 91.189.88.181:17070
              </p>
            </div>
          </div>
        </div>

        <div className="p-form__group row">
          <div className="col-3">
            <label htmlFor="username" className="p-form__label">
              Username
            </label>
          </div>

          <div className="col-8">
            <div className="p-form__control">
              <input
                type="text"
                id="username"
                name="username"
                onChange={handleInputChange}
              />
              <p className="p-form-help-text">
                The username you use to access the controller.
              </p>
            </div>
          </div>
        </div>

        <div className="p-form__group row">
          <div className="col-3">
            <label htmlFor="password" className="p-form__label">
              Password
            </label>
          </div>

          <div className="col-8">
            <div className="p-form__control">
              <input
                type="password"
                id="password"
                name="password"
                onChange={handleInputChange}
              />
              <p className="p-form-help-text">
                The password will be what you used when running{" "}
                <code>juju register</code> or if unchanged from the default it
                can be retrieved by running <code>juju dashboard</code>.
              </p>
            </div>
          </div>
        </div>

        <div
          className={classNames("p-form__group row", {
            "u-hide": formValues.username && formValues.password,
          })}
        >
          <div className="col-8 col-start-large-4">
            <input
              type="checkbox"
              id="identityProviderAvailable"
              name="identityProvider"
              defaultChecked={false}
              onChange={handleInputChange}
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
          <div className="col-8 col-start-large-4">
            <i className="p-icon--warning"></i>
            <div className="controller-link-message">
              Visit {generateTheControllerLink(formValues?.wsControllerHost)} to
              accept the certificate on this controller to enable a secure
              connection
            </div>
          </div>
        </div>
        <div className="row horizontal-rule">
          <div className="col-8 col-start-large-4">
            <input
              type="checkbox"
              id="certificateHasBeenAccepted"
              name="certificateAccepted"
              defaultChecked={false}
              onChange={handleInputChange}
              required={true}
            />
            <label htmlFor="certificateHasBeenAccepted">
              The SSL certificate, if any, has been accepted.{" "}
              <span className="required-star">*</span>
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
        <Details />
      </div>
    </Layout>
  );
}
