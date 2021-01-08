import { ReactElement, useEffect, useState } from "react";
import { getApplicationConfig } from "juju/index";
import { useStore } from "react-redux";

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
};

type Config = {
  [key: string]: ConfigData;
};

export type ConfigProps = {
  config: ConfigData;
  selectedConfig: ConfigData | undefined;
  setSelectedConfig: Function;
};

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

  useEffect(() => {
    getApplicationConfig(modelUUID, appName, reduxStore.getState()).then(
      (result) => {
        // Add the key to the config object to make for easier use later.
        const config: Config = {};
        Object.keys(result.config).forEach((key) => {
          config[key] = result.config[key];
          config[key].name = key;
        });
        setConfig(config);
      }
    );
  }, [appName, modelUUID, reduxStore]);

  const configSelected = false;
  return (
    <div className="config-panel">
      <div className="row">
        <div className="config-panel__config-list col-6">
          <div className="config-panel__list-header">{title}</div>
          <div className="config-panel__list">
            {generateConfigElementList(
              config,
              selectedConfig,
              setSelectedConfig
            )}
          </div>
        </div>
        <div className="config-panel__description col-6">
          {configSelected ? (
            <>
              <h4>Configuration Description</h4>
              <div>{selectedConfig && selectedConfig.description}</div>
            </>
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
  setSelectedConfig: Function
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
        />
      );
    } else {
      return (
        <TextAreaConfig
          key={config.name}
          config={config}
          selectedConfig={selectedConfig}
          setSelectedConfig={setSelectedConfig}
        />
      );
    }
  });

  return elements;
}
