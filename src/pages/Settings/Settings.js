import React from "react";
import Notification from "@canonical/react-components/dist/components/Notification/Notification";

import Header from "components/Header/Header";
import Layout from "components/Layout/Layout";

import "./settings.scss";

export default function Settings() {
  return (
    <Layout>
      <Header>
        <span className="l-content settings__header">Settings</span>
      </Header>
      <div className="l-content">
        <div className="settings__toggles">
          <Notification>
            You will need to refresh your browser for this change to take effect
          </Notification>
          <label className="row">
            <div className="col-6">Disable Analytics</div>
            <div className="col-3">
              <input
                type="checkbox"
                className="p-switch"
                defaultChecked={
                  localStorage.getItem("disableAnalytics") === "true"
                }
                onChange={(e) => {
                  localStorage.setItem(
                    "disableAnalytics",
                    e.currentTarget.checked
                  );
                }}
              />
              <div className="p-switch__slider"></div>
            </div>
          </label>
        </div>
      </div>
    </Layout>
  );
}
