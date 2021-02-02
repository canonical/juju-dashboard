import { ReactElement, ReactNode, useEffect, useState } from "react";
import { getApplicationConfig, setApplicationConfig } from "juju";
import { useStore } from "react-redux";
import type { Store } from "redux";
import classnames from "classnames";
import cloneDeep from "clone-deep";

import Spinner from "@canonical/react-components/dist/components/Spinner";

import { generateIconImg, isSet } from "app/utils";
import FadeIn from "animations/FadeIn";
import ConfirmationModal from "components/ConfirmationModal/ConfirmationModal";
import SlidePanel from "components/SlidePanel/SlidePanel";

import bulbImage from "static/images/bulb.svg";
import boxImage from "static/images/no-config-params.svg";

import BooleanConfig from "./BooleanConfig";
import TextAreaConfig from "./TextAreaConfig";

import "./_config-panel.scss";

type Props = {
  appName: string;
  charm: string;
  modelUUID: string;
  onClose: () => void;
};

type ConfigData = {
  name: string;
  default: any;
  description: string;
  source: "default" | "user";
  type: "string" | "int" | "float" | "boolean";
  value: any;
  newValue: any;
};

type Config = {
  [key: string]: ConfigData;
};

export type ConfigProps = {
  config: ConfigData;
  selectedConfig: ConfigData | undefined;
  setSelectedConfig: Function;
  setNewValue: SetNewValue;
};

type SetNewValue = (name: string, value: any) => void;

type ConfirmTypes = "apply" | "cancel";

export default function ConfigPanel({
  appName,
  charm,
  modelUUID,
  onClose,
}: Props): ReactElement {
  const reduxStore = useStore();
  const [config, setConfig] = useState<Config>({});
  const [selectedConfig, setSelectedConfig] = useState<ConfigData | undefined>(
    undefined
  );
  const [enableSave, setEnableSave] = useState<boolean>(false);
  const [showResetAll, setShowResetAll] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [savingConfig, setSavingConfig] = useState<boolean>(false);
  const [confirmOpen, setConfirmOpen] = useState<boolean>(false);
  const [confirmType, setConfirmType] = useState<ConfirmTypes>("apply");

  useEffect(() => {
    setIsLoading(true);
    getConfig(
      modelUUID,
      appName,
      reduxStore,
      setIsLoading,
      setConfig,
      checkAllDefaults
    );
  }, [appName, modelUUID, reduxStore]);

  function setNewValue(name: string, value: any) {
    const newConfig = cloneDeep(config);
    newConfig[name].newValue = value;
    if (newConfig[name].newValue === newConfig[name].value) {
      delete newConfig[name].newValue;
    }
    setConfig(newConfig);
    checkEnableSave(newConfig);
    checkAllDefaults(newConfig);
  }

  function checkAllDefaults(config: Config) {
    const shouldShow = Object.keys(config).some((key) => {
      const cfg = config[key];
      if (isSet(cfg.newValue)) {
        if (cfg.newValue === cfg.default) {
          return false;
        } else if (cfg.newValue !== cfg.default) {
          return true;
        }
      } else if (cfg.value !== cfg.default) {
        return true;
      }
      return false;
    });
    setShowResetAll(shouldShow);
  }

  function allFieldsToDefault() {
    const newConfig = cloneDeep(config);
    Object.keys(newConfig).forEach((key) => {
      const cfg = newConfig[key];
      if (cfg.value !== cfg.default) {
        cfg.newValue = cfg.default;
      } else if (cfg.newValue !== cfg.default) {
        cfg.newValue = cfg.default;
      }
    });
    setConfig(newConfig);
    checkAllDefaults(newConfig);
    checkEnableSave(newConfig);
  }

  function checkEnableSave(newConfig: Config) {
    const fieldChanged = hasChangedFields(newConfig);
    setEnableSave(fieldChanged);
  }

  function hasChangedFields(newConfig: Config): boolean {
    return Object.keys(newConfig).some(
      (key) =>
        isSet(newConfig[key].newValue) &&
        newConfig[key].newValue !== newConfig[key].value
    );
  }

  function handleSubmit() {
    setConfirmType("apply");
    setConfirmOpen(true);
  }

  function handleCancel() {
    if (hasChangedFields(config)) {
      setConfirmType("cancel");
      setConfirmOpen(true);
    } else {
      onClose();
    }
  }

  async function _submitToJuju() {
    setSavingConfig(true);
    const error = await setApplicationConfig(
      modelUUID,
      appName,
      config,
      reduxStore.getState()
    );
    // It returns an empty object if it's successful.
    if (typeof error === "string") {
      // XXX Surface this to the user.
      console.error("error setting config", error);
    }
    await getConfig(
      modelUUID,
      appName,
      reduxStore,
      setIsLoading,
      setConfig,
      checkAllDefaults
    );
    setSavingConfig(false);
    setEnableSave(false);
    setConfirmOpen(false);
  }

  function generateConfirmationDialog(): ReactElement | null {
    if (confirmOpen) {
      const changedConfigList = generateChangedKeyValues(config);

      if (confirmType === "apply") {
        return SaveConfirmation(
          appName,
          changedConfigList,
          () => {
            setConfirmOpen(false);
            _submitToJuju();
          },
          () => setConfirmOpen(false)
        );
      }
      if (confirmType === "cancel") {
        return CancelConfirmation(
          appName,
          changedConfigList,
          () => {
            setConfirmOpen(false);
            onClose();
          },
          () => setConfirmOpen(false)
        );
      }
    }
    return null;
  }

  function checkCanClose() {
    if (hasChangedFields(config)) {
      // They are trying to close the panel but the user has
      // unchanged values so show the confirmation dialog.
      setConfirmType("cancel");
      setConfirmOpen(true);
      return false;
    }
    onClose();
    return true;
  }

  return (
    <SlidePanel
      isActive={true}
      onClose={checkCanClose}
      isLoading={!appName}
      className="config-panel"
    >
      <div className="config-panel">
        {isLoading ? (
          <div className="full-size u-vertically-center">
            <Spinner />
          </div>
        ) : !isLoading && (!config || Object.keys(config).length === 0) ? (
          <FadeIn isActive={true}>
            <div className="full-size u-align-center">
              <NoConfigMessage />
            </div>
          </FadeIn>
        ) : (
          <FadeIn isActive={true} className="config-content row">
            <div className="config-panel__config-list col-6">
              <div className="config-panel__list-header">
                <div className="entity-name">
                  {generateIconImg(appName, charm)} {appName}
                </div>
                <div>
                  <button
                    className={classnames(
                      "u-button-neutral config-panel__hide-button",
                      {
                        "config-panel__show-button": showResetAll,
                      }
                    )}
                    onClick={allFieldsToDefault}
                  >
                    Reset all values
                  </button>
                </div>
              </div>

              <div className="config-panel__list">
                {generateConfigElementList(
                  config,
                  selectedConfig,
                  setSelectedConfig,
                  setNewValue
                )}
              </div>
              {generateConfirmationDialog()}
              <div
                className={classnames("config-panel__drawer", {
                  "is-open": confirmOpen,
                })}
              >
                <div className="config-panel__button-row">
                  <button className="p-button--neutral" onClick={handleCancel}>
                    Cancel
                  </button>
                  <button
                    className={classnames(
                      "p-button--positive config-panel__save-button",
                      {
                        "is-active": savingConfig,
                      }
                    )}
                    onClick={handleSubmit}
                    disabled={!enableSave}
                  >
                    {!savingConfig ? (
                      "Save and apply"
                    ) : (
                      <>
                        <i className="p-icon--spinner u-animation--spin is-light"></i>
                        <span>Saving&hellip;</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
            <div className="config-panel__description col-6">
              {selectedConfig ? (
                <FadeIn
                  key={selectedConfig.name}
                  isActive={true}
                  className="config-panel__description-wrapper"
                >
                  <h4>Configuration Description</h4>
                  <h5>{selectedConfig.name}</h5>
                  <pre>{selectedConfig.description}</pre>
                </FadeIn>
              ) : (
                <div className="config-panel__no-description u-vertically-center">
                  <NoDescriptionMessage />
                </div>
              )}
            </div>
          </FadeIn>
        )}
      </div>
    </SlidePanel>
  );
}

function getConfig(
  modelUUID: string,
  appName: string,
  reduxStore: Store,
  setIsLoading: (value: boolean) => void,
  setConfig: (value: Config) => void,
  checkAllDefaults: (value: Config) => void
) {
  return getApplicationConfig(modelUUID, appName, reduxStore.getState()).then(
    (result) => {
      // Add the key to the config object to make for easier use later.
      const config: Config = {};
      Object.keys(result.config).forEach((key) => {
        config[key] = result.config[key];
        config[key].name = key;
      });
      setIsLoading(false);
      setConfig(config);
      checkAllDefaults(config);
    }
  );
}

function generateConfigElementList(
  configs: Config,
  selectedConfig: ConfigData | undefined,
  setSelectedConfig: Function,
  setNewValue: SetNewValue
) {
  const elements = Object.keys(configs).map((key) => {
    const config = configs[key];
    if (config.type === "boolean") {
      return (
        <BooleanConfig
          key={config.name}
          config={config}
          selectedConfig={selectedConfig}
          setSelectedConfig={setSelectedConfig}
          setNewValue={setNewValue}
        />
      );
    } else {
      return (
        <TextAreaConfig
          key={config.name}
          config={config}
          selectedConfig={selectedConfig}
          setSelectedConfig={setSelectedConfig}
          setNewValue={setNewValue}
        />
      );
    }
  });

  return elements;
}

function generateChangedKeyValues(config: Config) {
  const changedValues = Object.keys(config).reduce(
    (acc: ReactNode[], key: string) => {
      const cfg = config[key];
      if (isSet(cfg.newValue) && cfg.newValue !== cfg.value) {
        acc.push(
          <div key={key}>
            <h5>{key}</h5>
            <pre>{cfg.newValue}</pre>
          </div>
        );
      }
      return acc;
    },
    []
  );
  return changedValues;
}

function NoConfigMessage() {
  return (
    <div className="config-panel__message">
      <img src={boxImage} alt="" className="config-panel--center-img" />
      <h4>This application doesn't have any configuration parameters</h4>
    </div>
  );
}

function NoDescriptionMessage() {
  return (
    <div className="config-panel__message">
      <img src={bulbImage} alt="" className="config-panel--center-img" />
      <h4>
        Click on a configuration row to view its related description and
        parameters
      </h4>
    </div>
  );
}

function CancelConfirmation(
  appName: string,
  changedConfigList: ReactNode,
  confirmFunction: () => void,
  cancelFunction: () => void
): ReactElement {
  return (
    <ConfirmationModal
      body={
        <>
          <h4>Are you sure you wish to cancel?</h4>
          <p>
            You have edited the following values to the {appName} configuration:
          </p>
          {changedConfigList}
        </>
      }
      buttonRow={[
        <button
          className="p-button--neutral"
          key="cancel"
          onClick={cancelFunction}
        >
          Continue editing
        </button>,
        <button
          className="p-button--negative"
          key="save"
          onClick={confirmFunction}
        >
          Yes, I'm sure
        </button>,
      ]}
    />
  );
}

function SaveConfirmation(
  appName: string,
  changedConfigList: ReactNode,
  confirmFunction: () => void,
  cancelFunction: () => void
): ReactElement {
  return (
    <ConfirmationModal
      body={
        <>
          <h4>Are you sure you wish to apply these changes?</h4>
          <p>
            You have edited the following values to the {appName} configuration:
          </p>
          {changedConfigList}
        </>
      }
      buttonRow={
        <div>
          <div className="config-panel__modal-button-row-hint">
            You can revert back to the applications default settings by clicking
            the “Reset all values” button; or reset each edited field by
            clicking “Use default”.
          </div>
          <div>
            <button
              className="p-button--neutral"
              key="cancel"
              onClick={cancelFunction}
            >
              Cancel
            </button>
            <button
              className="p-button--positive"
              key="save"
              onClick={confirmFunction}
            >
              Yes, apply changes
            </button>
          </div>
        </div>
      }
    />
  );
}
