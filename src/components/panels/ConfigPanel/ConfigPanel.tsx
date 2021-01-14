import { ReactElement, useEffect, useState } from "react";
import { getApplicationConfig, setApplicationConfig } from "juju/index";
import { useStore } from "react-redux";
import classnames from "classnames";
import cloneDeep from "clone-deep";

import Spinner from "@canonical/react-components/dist/components/Spinner";

import BooleanConfig from "./BooleanConfig";
import TextAreaConfig from "./TextAreaConfig";

import "./_config-panel.scss";

type Props = {
  appName: string;
  title: ReactElement;
  modelUUID: string;
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
}: Props): ReactElement {
  const reduxStore = useStore();
  const [config, setConfig] = useState<Config>({});
  const [selectedConfig, setSelectedConfig] = useState<ConfigData | undefined>(
    undefined
  );
  const [shouldShowDrawer, setShouldShowDrawer] = useState<Boolean>(false);
  const [showResetAll, setShowResetAll] = useState<Boolean>(false);
  const [isLoading, setIsLoading] = useState<Boolean>(true);

  useEffect(() => {
    setIsLoading(true);
    getApplicationConfig(modelUUID, appName, reduxStore.getState()).then(
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
  }, [appName, modelUUID, reduxStore]);

  function setNewValue(name: string, value: any) {
    config[name].newValue = value;
    if (config[name].newValue === config[name].value) {
      delete config[name].newValue;
    }
    const fieldChanged = Object.keys(config).some(
      (key) => config[key].newValue
    );
    if (fieldChanged) {
      setShouldShowDrawer(true);
    } else if (!fieldChanged && shouldShowDrawer) {
      setShouldShowDrawer(false);
    }
    setConfig(config);
    checkAllDefaults(config);
  }

  function checkAllDefaults(config: Config) {
    const shouldShow = Object.keys(config).some((key) => {
      const cfg = config[key];
      return (
        cfg.default !== cfg.value ||
        (cfg.newValue && cfg.default !== cfg.newValue)
      );
    });
    setShowResetAll(shouldShow);
  }

  function allFieldsToDefault() {
    const newConfig = cloneDeep(config);
    Object.keys(newConfig).forEach((key) => {
      newConfig[key].value = newConfig[key].default;
      delete newConfig[key].newValue;
    });
    setConfig(newConfig);
    checkAllDefaults(newConfig);
    setShouldShowDrawer(false);
  }

  async function handleSubmit() {
    await setApplicationConfig(
      modelUUID,
      appName,
      config,
      reduxStore.getState()
    );
  }

  return (
    <div className="config-panel">
      <div className="row">
        <div className="config-panel__config-list col-6">
          <div className="config-panel__list-header row">
            <div className="col-4">{title}</div>
            <button
              className={classnames("u-button-neutral col-2", {
                "u-hide": !showResetAll,
              })}
              onClick={allFieldsToDefault}
            >
              Reset all values
            </button>
          </div>

          <div
            className={classnames("config-panel__list", {
              "is-loading u-vertically-center": isLoading,
            })}
          >
            {isLoading ? (
              <Spinner />
            ) : (
              generateConfigElementList(
                config,
                selectedConfig,
                setSelectedConfig,
                setNewValue
              )
            )}
          </div>
          <div
            className={classnames("config-panel__drawer", {
              "config-panel__drawer--hidden": !shouldShowDrawer,
            })}
          >
            <button className="p-button--neutral">Cancel</button>
            <button className="p-button--positive" onClick={handleSubmit}>
              Save & apply
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
              <div>
                Click on a configuration row to view its related description and
                parameters
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
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
