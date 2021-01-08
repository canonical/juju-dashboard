import { ReactElement, useEffect, useState } from "react";
import { getApplicationConfig } from "juju/index";
import { useStore } from "react-redux";

import "./_config-panel.scss";

type Props = {
  appName: string;
  modelUUID: string;
};

type ConfigData = {
  name: string,
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
  modelUUID,
}: Props): ReactElement {
  const reduxStore = useStore();
  const [config, setConfig] = useState<Config>({});
  const [selectedConfig, setSelectedConfig] = useState<
    Config | undefined
  >(undefined);

  useEffect(() => {
    getApplicationConfig(modelUUID, appName, reduxStore.getState()).then(
      (result) => {
        // Add the key to the config object to make for easier use later.
        const config:Config = {};
        Object.keys(result.config).forEach(key => {
          config[key] = result.config[key];
          config[key].name = key;
        })
        setConfig(config);
      }
    );
  }, [appName, modelUUID, reduxStore]);

  console.log(config);

  const configSelected = false;
  return (
    <div className="config-panel">
      <div className="row">
        <div className="config-panel__config-list col-6">
          <div className="config-panel__list-header">Icon Mysql</div>
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
