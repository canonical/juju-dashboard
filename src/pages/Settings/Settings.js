import Header from "components/Header/Header";
import BaseLayout from "layout/BaseLayout/BaseLayout";

import FadeIn from "animations/FadeIn";

import useLocalStorage from "hooks/useLocalStorage";
import useWindowTitle from "hooks/useWindowTitle";

import { Switch } from "@canonical/react-components";
import "./settings.scss";

export default function Settings() {
  useWindowTitle("Settings");

  const [disableAnalytics, setDisableAnalytics] = useLocalStorage(
    "disableAnalytics",
    false
  );

  return (
    <BaseLayout>
      <Header>
        <span className="l-content settings__header">Settings</span>
      </Header>
      <FadeIn isActive={true}>
        <div className="l-content settings">
          <div className="settings__toggles">
            <div className="settings__toggles-group">
              <Switch
                label="Disable analytics"
                defaultChecked={disableAnalytics}
                onChange={() => {
                  setDisableAnalytics(!disableAnalytics);
                }}
              />
              <div className="settings__toggles-info">
                You will need to refresh your browser for this setting to take
                effect.
              </div>
            </div>
          </div>
        </div>
      </FadeIn>
    </BaseLayout>
  );
}
