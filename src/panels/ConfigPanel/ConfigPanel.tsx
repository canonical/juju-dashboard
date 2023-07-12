import { Notification } from "@canonical/react-components";
import classnames from "classnames";
import cloneDeep from "clone-deep";
import type { ReactNode, MouseEvent } from "react";
import { useEffect, useRef, useState } from "react";
import type { Store } from "redux";

import FadeIn from "animations/FadeIn";
import CharmIcon from "components/CharmIcon";
import ConfirmationModal from "components/ConfirmationModal/ConfirmationModal";
import Panel from "components/Panel";
import ScrollOnRender from "components/ScrollOnRender";
import { isSet } from "components/utils";
import useAnalytics from "hooks/useAnalytics";
import { useQueryParams } from "hooks/useQueryParams";
import type { Config, ConfigData, ConfigValue } from "juju/api";
import { getApplicationConfig, setApplicationConfig } from "juju/api";
import bulbImage from "static/images/bulb.svg";
import boxImage from "static/images/no-config-params.svg";
import { useAppStore } from "store/store";

import BooleanConfig from "./BooleanConfig";
import type { SetNewValue, SetSelectedConfig } from "./ConfigField";
import NumberConfig from "./NumberConfig";
import TextAreaConfig from "./TextAreaConfig";
import "./_config-panel.scss";

export enum Label {
  CANCEL_BUTTON = "Cancel",
  CANCEL_CONFIRM = "Are you sure you wish to cancel?",
  CANCEL_CONFIRM_CANCEL_BUTTON = "Continue editing",
  CANCEL_CONFIRM_CONFIRM_BUTTON = "Yes, I'm sure",
  NONE = "This application doesn't have any configuration parameters",
  RESET_BUTTON = "Reset all values",
  SAVE_BUTTON = "Save and apply",
  SAVE_CONFIRM = "Are you sure you wish to apply these changes?",
  SAVE_CONFIRM_CANCEL_BUTTON = "Cancel",
  SAVE_CONFIRM_CONFIRM_BUTTON = "Yes, apply changes",
}

export enum TestId {
  PANEL = "config-panel",
}

type ConfirmTypes = "apply" | "cancel" | null;

const generateErrors = (errors: string[], scrollArea?: HTMLElement | null) =>
  errors.map((error) => (
    <ScrollOnRender key={error} scrollArea={scrollArea}>
      <Notification severity="negative">{error}</Notification>
    </ScrollOnRender>
  ));

export default function ConfigPanel(): JSX.Element {
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
  const [query, setQuery] = useQueryParams<{
    charm: string | null;
    entity: string | null;
    modelUUID: string | null;
    panel: string | null;
  }>({
    charm: null,
    entity: null,
    modelUUID: null,
    panel: null,
  });
  const { entity: appName, charm, modelUUID } = query;

  useEffect(() => {
    if (modelUUID && appName) {
      setIsLoading(true);
      getConfig(
        modelUUID,
        appName,
        reduxStore,
        setIsLoading,
        setConfig,
        checkAllDefaults
      );
    }
  }, [appName, modelUUID, reduxStore]);

  useEffect(() => {
    sendAnalytics({
      category: "User",
      action: "Config panel opened",
    });
  }, [sendAnalytics]);

  const onClose = () =>
    setQuery(
      {
        charm: null,
        entity: null,
        modelUUID: null,
        panel: null,
      },
      { replace: true }
    );

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
    if (!modelUUID || !appName) {
      return;
    }
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
    if (confirmType && appName) {
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

  function checkCanClose(event: KeyboardEvent | MouseEvent) {
    if (!("code" in event)) {
      const target = event.target as HTMLElement;
      if (
        // The confirmation opens over the panel so need to prevent clicks
        // inside that panel from triggering a new confirmation.
        target.closest(".p-confirmation-modal") ||
        target.closest(".p-panel")
      ) {
        return false;
      }
    }
    if (hasChangedFields(config)) {
      // They are trying to close the panel but the user has
      // unchanged values so show the confirmation dialog.
      setConfirmType("cancel");
      return false;
    }
    return true;
  }

  return (
    <Panel
      checkCanClose={checkCanClose}
      data-testid={TestId.PANEL}
      panelClassName="config-panel"
      isSplit
      loading={isLoading}
      ref={scrollArea}
      title={
        <h5>
          {appName && charm ? (
            <CharmIcon name={appName} charmId={charm} />
          ) : null}{" "}
          {appName}
        </h5>
      }
    >
      <>
        {!isLoading && (!config || Object.keys(config).length === 0) ? (
          <FadeIn isActive={true}>
            <div className="full-size u-align-center">
              <NoConfigMessage />
            </div>
          </FadeIn>
        ) : (
          <div className="p-panel__content p-panel_content--padded aside-split-wrapper">
            <div className="aside-split-col">
              <div className="config-panel__list-header">
                <h5>Configure</h5>
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
                    {Label.RESET_BUTTON}
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
                  <button className="p-button--neutral" onClick={handleCancel}>
                    {Label.CANCEL_BUTTON}
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
                      Label.SAVE_BUTTON
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
            <div className="config-panel__description aside-split-col">
              {selectedConfig ? (
                <FadeIn
                  key={selectedConfig.name}
                  isActive={true}
                  className="config-panel__description-wrapper"
                >
                  <>
                    <h4 className="p-heading--5">Configuration description</h4>
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
          </div>
        )}
      </>
    </Panel>
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
          {Label.CANCEL_CONFIRM_CANCEL_BUTTON}
        </button>,
        <button
          className="p-button--negative"
          key="save"
          onClick={confirmFunction}
        >
          {Label.CANCEL_CONFIRM_CONFIRM_BUTTON}
        </button>,
      ]}
      onClose={cancelFunction}
    >
      <h4>{Label.CANCEL_CONFIRM}</h4>
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
              {Label.SAVE_CONFIRM_CANCEL_BUTTON}
            </button>
            <button
              className="p-button--positive"
              key="save"
              onClick={confirmFunction}
            >
              {Label.SAVE_CONFIRM_CONFIRM_BUTTON}
            </button>
          </div>
        </div>
      }
      onClose={cancelFunction}
    >
      <h4>{Label.SAVE_CONFIRM}</h4>
      <p>
        You have edited the following values to the {appName} configuration:
      </p>
      {changedConfigList}
    </ConfirmationModal>
  );
}
