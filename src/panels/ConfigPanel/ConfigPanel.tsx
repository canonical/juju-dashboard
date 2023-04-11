import classnames from "classnames";
import cloneDeep from "clone-deep";
import {
  Config,
  ConfigData,
  getApplicationConfig,
  setApplicationConfig,
} from "juju/api";
import { ReactNode, useEffect, useRef, useState } from "react";
import type { Store } from "redux";

import {
  Notification,
  Spinner,
  useListener,
} from "@canonical/react-components";

import FadeIn from "animations/FadeIn";
import { generateIconImg, isSet } from "components/utils";
import ConfirmationModal from "components/ConfirmationModal/ConfirmationModal";
import ScrollOnRender from "components/ScrollOnRender";
import SlidePanel from "components/SlidePanel/SlidePanel";

import useAnalytics from "hooks/useAnalytics";

import bulbImage from "static/images/bulb.svg";
import boxImage from "static/images/no-config-params.svg";
import { useAppStore } from "store/store";

import BooleanConfig from "./BooleanConfig";
import TextAreaConfig from "./TextAreaConfig";

import "./_config-panel.scss";
import { SetNewValue, SetSelectedConfig } from "./ConfigField";
import NumberConfig from "./NumberConfig";
import { ConfigValue } from "../../juju/api";

export enum Label {
  NONE = "This application doesn't have any configuration parameters",
}

type Props = {
  appName: string;
  charm: string;
  modelUUID: string;
  onClose: () => void;
};

type ConfirmTypes = "apply" | "cancel" | null;

const generateErrors = (errors: string[], scrollArea?: HTMLElement | null) =>
  errors.map((error) => (
    <ScrollOnRender key={error} scrollArea={scrollArea}>
      <Notification severity="negative">{error}</Notification>
    </ScrollOnRender>
  ));

export default function ConfigPanel({
  appName,
  charm,
  modelUUID,
  onClose,
}: Props): JSX.Element {
  const reduxStore = useAppStore();
  const [config, setConfig] = useState<Config>({});
  const [selectedConfig, setSelectedConfig] = useState<ConfigData | undefined>(
    undefined
  );
  const [enableSave, setEnableSave] = useState<boolean>(false);
  const [showResetAll, setShowResetAll] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [savingConfig, setSavingConfig] = useState<boolean>(false);
  const [confirmType, setConfirmType] = useState<ConfirmTypes>(null);
  const [formErrors, setFormErrors] = useState<string[] | null>(null);
  const scrollArea = useRef<HTMLDivElement>(null);

  const sendAnalytics = useAnalytics();

  useListener(
    window,
    (e: KeyboardEvent) => {
      if (e.code === "Escape" && confirmType !== null) {
        setConfirmType(null);
      }
    },
    "keydown"
  );

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

  useEffect(() => {
    sendAnalytics({
      category: "User",
      action: "Config panel opened",
    });
  }, [sendAnalytics]);

  function setNewValue(name: string, value: ConfigValue) {
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
  }

  function handleCancel() {
    if (hasChangedFields(config)) {
      setConfirmType("cancel");
    } else {
      onClose();
    }
  }

  async function _submitToJuju() {
    setSavingConfig(true);
    const response = await setApplicationConfig(
      modelUUID,
      appName,
      config,
      reduxStore.getState()
    );
    const errors = response?.results?.reduce<string[]>((collection, result) => {
      if (result.error) {
        collection.push(result.error.message);
      }
      return collection;
    }, []);
    setSavingConfig(false);
    setEnableSave(false);
    setConfirmType(null);
    if (errors?.length) {
      setFormErrors(errors);
      return;
    }
    await getConfig(
      modelUUID,
      appName,
      reduxStore,
      setIsLoading,
      setConfig,
      checkAllDefaults
    );
    sendAnalytics({
      category: "User",
      action: "Config values updated",
    });
    onClose();
  }

  function generateConfirmationDialog(): JSX.Element | null {
    if (confirmType) {
      const changedConfigList = generateChangedKeyValues(config);

      if (confirmType === "apply") {
        return SaveConfirmation(
          appName,
          changedConfigList,
          () => {
            setConfirmType(null);
            // Clear the form errors if there were any from a previous submit.
            setFormErrors(null);
            _submitToJuju();
          },
          () => setConfirmType(null)
        );
      }
      if (confirmType === "cancel") {
        return CancelConfirmation(
          appName,
          changedConfigList,
          () => {
            setConfirmType(null);
            onClose();
          },
          () => setConfirmType(null)
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
      ref={scrollArea}
    >
      <div>
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
            <>
              <div className="config-panel__config-list col-6">
                <div className="config-panel__list-header">
                  <h4 className="entity-name">
                    {generateIconImg(appName, charm)} {appName}
                  </h4>
                  <div
                    className={classnames("config-panel__reset-all", {
                      "config-panel__hide-button": !showResetAll,
                      "config-panel__show-button": showResetAll,
                    })}
                  >
                    <button
                      className="u-button-neutral"
                      onClick={allFieldsToDefault}
                    >
                      Reset all values
                    </button>
                  </div>
                </div>

                <div className="config-panel__list">
                  {formErrors
                    ? generateErrors(formErrors, scrollArea?.current)
                    : null}
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
                    "is-open": confirmType !== null,
                  })}
                >
                  <div className="config-panel__button-row">
                    <button
                      className="p-button--neutral"
                      onClick={handleCancel}
                    >
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
                      disabled={!enableSave || savingConfig}
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
                    <>
                      <h4>Configuration Description</h4>
                      <h5>{selectedConfig.name}</h5>
                      <pre>{selectedConfig.description}</pre>
                    </>
                  </FadeIn>
                ) : (
                  <div className="config-panel__no-description u-vertically-center">
                    <NoDescriptionMessage />
                  </div>
                )}
              </div>
            </>
          </FadeIn>
        )}
      </div>
    </SlidePanel>
  );
}

async function getConfig(
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
      // The config param can be null.
      Object.keys(result?.config ?? {}).forEach((key) => {
        config[key] = result?.config[key];
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
  setSelectedConfig: SetSelectedConfig,
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
    } else if (config.type === "int") {
      return (
        <NumberConfig
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
    (accumulator: ReactNode[], key: string) => {
      const cfg = config[key];
      if (isSet(cfg.newValue) && cfg.newValue !== cfg.value) {
        accumulator.push(
          <div key={key}>
            <h5>{key}</h5>
            <pre>{cfg.newValue}</pre>
          </div>
        );
      }
      return accumulator;
    },
    []
  );
  return changedValues;
}

function NoConfigMessage() {
  return (
    <div className="config-panel__message">
      <img src={boxImage} alt="" className="config-panel--center-img" />
      <h4>{Label.NONE}</h4>
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
): JSX.Element {
  return (
    <ConfirmationModal
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
    >
      <h4>Are you sure you wish to cancel?</h4>
      <p>
        You have edited the following values to the {appName} configuration:
      </p>
      {changedConfigList}
    </ConfirmationModal>
  );
}

function SaveConfirmation(
  appName: string,
  changedConfigList: ReactNode,
  confirmFunction: () => void,
  cancelFunction: () => void
): JSX.Element {
  return (
    <ConfirmationModal
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
    >
      <h4>Are you sure you wish to apply these changes?</h4>
      <p>
        You have edited the following values to the {appName} configuration:
      </p>
      {changedConfigList}
    </ConfirmationModal>
  );
}
