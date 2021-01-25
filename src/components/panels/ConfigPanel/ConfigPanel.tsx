import { ReactElement, useEffect, useState } from "react";
import { getApplicationConfig, setApplicationConfig } from "juju/index";
import { useStore } from "react-redux";
import type { Store } from "redux";
import classnames from "classnames";
import cloneDeep from "clone-deep";

import Spinner from "@canonical/react-components/dist/components/Spinner";

import { isSet } from "app/utils";

import bulbImage from "static/images/bulb.svg";
import boxImage from "static/images/no-config-params.svg";

import BooleanConfig from "./BooleanConfig";
import TextAreaConfig from "./TextAreaConfig";

import "./_config-panel.scss";

type Props = {
  appName: string;
  title: ReactElement;
  modelUUID: string;
  closePanel: () => void;
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

export default function ConfigPanel({
  appName,
  title,
  modelUUID,
  closePanel,
}: Props): ReactElement {
  const reduxStore = useStore();
  const [config, setConfig] = useState<Config>({});
  const [selectedConfig, setSelectedConfig] = useState<ConfigData | undefined>(
    undefined
  );
  const [enableSave, setEnableSave] = useState<Boolean>(false);
  const [showResetAll, setShowResetAll] = useState<Boolean>(false);
  const [isLoading, setIsLoading] = useState<Boolean>(true);
  const [savingConfig, setSavingConfig] = useState<Boolean>(false);

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
      }
    });
    setConfig(newConfig);
    checkAllDefaults(newConfig);
    checkEnableSave(newConfig);
  }

  function checkEnableSave(newConfig: Config) {
    const fieldChanged = Object.keys(newConfig).some((key) =>
      isSet(newConfig[key].newValue)
    );
    setEnableSave(fieldChanged);
  }

  async function handleSubmit() {
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
  }

  return (
    <div className="config-panel row">
      {isLoading ? (
        <div className="full-size u-vertically-center">
          <Spinner />
        </div>
      ) : !isLoading && (!config || Object.keys(config).length === 0) ? (
        <div className="full-size u-align-center">
          <NoConfigMessage />
        </div>
      ) : (
        <>
          <div className="config-panel__config-list col-6">
            <div className="config-panel__list-header">
              {title}
              <div>
                <button
                  className={classnames("u-button-neutral", {
                    "u-hide": !showResetAll,
                  })}
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
            <div className="config-panel__drawer">
              <button className="p-button--neutral" onClick={closePanel}>
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
                  "Save & apply"
                ) : (
                  <>
                    <i className="p-icon--spinner u-animation--spin is-light"></i>
                    <span>Saving&hellip;</span>
                  </>
                )}
              </button>
            </div>
          </div>
          <div className="config-panel__description col-6">
            {selectedConfig ? (
              <div className="config-panel__description-wrapper">
                <h4>Configuration Description</h4>
                <h5>{selectedConfig.name}</h5>
                <pre>{selectedConfig.description}</pre>
              </div>
            ) : (
              <div className="config-panel__no-description u-vertically-center">
                <NoDescriptionMessage />
              </div>
            )}
          </div>
        </>
      )}
    </div>
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

function NoConfigMessage() {
  return (
    <div className="config-panel__message">
      <img src={boxImage} alt="3d box" className="config-panel--center-img" />
      <h4>This application doesn't have any configuration parameters</h4>
    </div>
  );
}

function NoDescriptionMessage() {
  return (
    <div className="config-panel__message">
      <img
        src={bulbImage}
        alt="lightbulb"
        className="config-panel--center-img"
      />
      <h4>
        Click on a configuration row to view its related description and
        parameters
      </h4>
    </div>
  );
}
