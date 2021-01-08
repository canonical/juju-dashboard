import { ReactElement, useEffect, useState } from "react";
import { getApplicationConfig } from "juju/index";
import { useStore } from "react-redux";

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

export default function ConfigPanel({
  appName,
  title,
  modelUUID,
}: Props): ReactElement {
  const reduxStore = useStore();
  const [config, setConfig] = useState<Config>({});
  const [selectedConfig, setSelectedConfig] = useState<Config | undefined>(
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
            {generateConfigElementList(config)}
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

type ConfigProps = {
  config: ConfigData;
};

function TextAreaConfig({ config }: ConfigProps): ReactElement {
  let defaultValue = null;
  let placeholder = null;
  // Use the placeholder styling native to the browser if the config value
  // is equal to the default value of the config option.
  if (config.default === config.value) {
    placeholder = config.default;
  } else {
    defaultValue = config.value;
  }

  return (
    <div className="config-input">
      <h5>{config.name}</h5>
      <textarea
        defaultValue={defaultValue}
        placeholder={placeholder}
      ></textarea>
    </div>
  );
}

function BooleanConfig({ config }: ConfigProps): ReactElement {
  return <div className="config-input"></div>;
}

function generateConfigElementList(configs: Config) {
  const elements = Object.keys(configs).map((key) => {
    const config = configs[key];
    if (config.type === "boolean") {
      return <BooleanConfig config={config} />;
    } else {
      return <TextAreaConfig config={config} />;
    }
  });

  return elements;
}
