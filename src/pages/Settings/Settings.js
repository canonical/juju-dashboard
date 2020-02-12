import React from "react";

import Notification from "@canonical/react-components/dist/components/Notification/Notification";

import Header from "components/Header/Header";
import Layout from "components/Layout/Layout";

import "./settings.scss";

export default function Settings() {
  const toggleAnalytics = () => {};

  return (
    <Layout>
      <Header>
        <span className="l-content settings__header">Settings</span>
      </Header>
      <div className="l-content">
        <div className="settings__toggles">
          <Notification>
            Changes to the options below are applied immediately.
          </Notification>
          <label className="row">
            <div className="col-6">Disable Google Analytics script</div>
            <div className="col-3">
              <input
                type="checkbox"
                className="p-switch"
                onChange={toggleAnalytics}
              />
              <div className="p-switch__slider"></div>
            </div>
          </label>
        </div>
      </div>
    </Layout>
  );
}
