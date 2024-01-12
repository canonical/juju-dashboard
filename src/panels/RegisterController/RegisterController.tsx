import { Button, Col, Row } from "@canonical/react-components";
import type { ChangeEvent } from "react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

import Panel from "components/Panel";
import useLocalStorage from "hooks/useLocalStorage";
import { usePanelQueryParams } from "panels/hooks";
import { thunks as appThunks } from "store/app";
import type { ControllerArgs } from "store/app/actions";
import { useAppDispatch } from "store/store";
import urls from "urls";

import "./register-controller.scss";

export enum Label {
  SUBMIT = "Add Controller",
  TITLE = "Register a controller",
  POLLING_ERROR = "Error while trying to connect and start polling.",
}

export const STORAGE_KEY = "additionalControllers";

type FormValues = {
  controllerName?: string;
  wsControllerHost?: string;
  username: string;
  password: string;
  identityProvider?: boolean;
  certificateAccepted?: boolean;
};

type RegisterControllerQueryParams = {
  panel: string | null;
};

export default function RegisterController() {
  const [formValues, setFormValues] = useState<FormValues>({
    password: "",
    username: "",
  });
  const dispatch = useAppDispatch();
  const [additionalControllers, setAdditionalControllers] = useLocalStorage<
    ControllerArgs[]
  >(STORAGE_KEY, []);
  const navigate = useNavigate();

  const defaultQueryParams: RegisterControllerQueryParams = { panel: null };
  const [, , handleRemovePanelQueryParams] =
    usePanelQueryParams<RegisterControllerQueryParams>(defaultQueryParams);

  const handleRegisterAController = () => {
    if (!formValues) {
      return;
    }
    // XXX Validate form values
    additionalControllers.push([
      `wss://${formValues.wsControllerHost}/api`, // wsControllerURL
      { user: formValues.username || "", password: formValues.password || "" }, // credentials
      formValues.identityProvider, // identityProviderAvailable
      true, // additional controller
    ]);
    setAdditionalControllers(additionalControllers);
    dispatch(appThunks.connectAndStartPolling()).catch((error) =>
      console.error(Label.POLLING_ERROR, error),
    );
    // Close the panel
    navigate(urls.controllers);
  };

  function handleInputChange(e: ChangeEvent<HTMLInputElement>) {
    setFormValues({
      ...formValues,
      [e.target.name]:
        e.target.type === "checkbox" ? e.target.checked : e.target.value,
    });
  }

  function generateTheControllerLink(controllerIP?: string) {
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
    <Panel
      drawer={
        <Row>
          <Col size={8} className="u-align--left">
            <p className="p-form-help-text register-a-controller__submit-segment">
              The credentials are stored locally in your browser and can be
              cleared on log-out.
            </p>
          </Col>
          <Col size={4}>
            <Button
              appearance="positive"
              onClick={() => handleRegisterAController()}
              disabled={!formValues.certificateAccepted}
            >
              {Label.SUBMIT}
            </Button>
          </Col>
        </Row>
      }
      panelClassName="register-controller"
      title={Label.TITLE}
      onRemovePanelQueryParams={handleRemovePanelQueryParams}
    >
      <p className="p-form-help-text">
        Information can be retrieved using the <code>juju show-controller</code>{" "}
        command.
      </p>
      <form
        className="p-form p-form--stacked"
        onSubmit={(event) => {
          event.preventDefault();
          handleRegisterAController();
        }}
      >
        <div className="p-form__group row">
          <div className="col-2">
            <label
              htmlFor="controller-name"
              className="p-form__label is-required"
            >
              Name
            </label>
          </div>

          <div className="col-10">
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
          <div className="col-2">
            <label htmlFor="host" className="p-form__label is-required">
              Host
            </label>
          </div>

          <div className="col-10">
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
          <div className="col-10 col-start-large-3">
            <input
              type="checkbox"
              id="identityProviderAvailable"
              name="identityProvider"
              defaultChecked={false}
              onChange={(event) => {
                setFormValues({
                  ...formValues,
                  identityProvider: event.target.checked,
                  password: "",
                  username: "",
                });
              }}
            />{" "}
            <label htmlFor="identityProviderAvailable">
              This controller uses an external identity provider.
            </label>
            <p className="p-form-help-text identity-provider ">
              This will be true for controllers with the `identity-url`
              parameter set.
            </p>
          </div>
        </div>
        <div className="p-form__group row">
          <div className="col-2">
            <label htmlFor="username" className="p-form__label">
              Username
            </label>
          </div>

          <div className="col-10">
            <div className="p-form__control">
              <input
                disabled={formValues.identityProvider}
                type="text"
                id="username"
                name="username"
                onChange={handleInputChange}
                value={formValues.username}
              />
              <p className="p-form-help-text">
                The username you use to access the controller.
              </p>
            </div>
          </div>
        </div>

        <div className="p-form__group row">
          <div className="col-2">
            <label htmlFor="password" className="p-form__label">
              Password
            </label>
          </div>

          <div className="col-10">
            <div className="p-form__control">
              <input
                disabled={formValues.identityProvider}
                type="password"
                id="password"
                name="password"
                onChange={handleInputChange}
                value={formValues.password}
              />
              <p className="p-form-help-text">
                The password will be what you used when running{" "}
                <code>juju register</code> or if unchanged from the default it
                can be retrieved by running <code>juju dashboard</code>.
              </p>
            </div>
          </div>
        </div>
        <div className="p-form__group row register-controller__warning">
          <div className="col-10 col-start-large-3">
            <i className="p-icon--warning"></i>
            <div className="controller-link-message">
              Visit {generateTheControllerLink(formValues?.wsControllerHost)} to
              accept the certificate on this controller to enable a secure
              connection
            </div>
          </div>
        </div>
        <div className="p-form__group row">
          <div className="col-10 col-start-large-3">
            <input
              type="checkbox"
              id="certificateHasBeenAccepted"
              name="certificateAccepted"
              defaultChecked={false}
              onChange={handleInputChange}
              required={true}
            />{" "}
            <label htmlFor="certificateHasBeenAccepted">
              The SSL certificate, if any, has been accepted.{" "}
              <span className="required-star">*</span>
            </label>
          </div>
        </div>
      </form>
    </Panel>
  );
}
