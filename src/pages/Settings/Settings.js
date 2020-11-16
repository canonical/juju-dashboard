import React from "react";
import Header from "components/Header/Header";
import Layout from "components/Layout/Layout";

import useLocalStorage from "hooks/useLocalStorage";
import useWindowTitle from "hooks/useWindowTitle";

import "./settings.scss";

export default function Settings() {
  useWindowTitle("Settings");

  const [disableAnalytics, setDisableAnalytics] = useLocalStorage(
    "disableAnalytics",
    false
  );

  return (
    <Layout>
      <Header>
        <span className="l-content settings__header">Settings</span>
      </Header>
      <div className="l-content settings">
        <div className="settings__toggles">
          <div className="settings__toggles-group">
            <label>
              Disable analytics
              <input
                type="checkbox"
                className="p-switch"
                defaultChecked={disableAnalytics}
                onChange={() => {
                  setDisableAnalytics(!disableAnalytics);
                }}
              />
              <div className="p-switch__slider"></div>
            </label>
            <div className="settings__toggles-info">
              You will need to refresh your browser for this setting to take
              effect.
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
