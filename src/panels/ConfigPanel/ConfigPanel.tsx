import type { ListSecretResult } from "@canonical/jujulib/dist/api/facades/secrets/SecretsV2";
import {
  Button,
  ConfirmationModal,
  Spinner,
} from "@canonical/react-components";
import classnames from "classnames";
import cloneDeep from "clone-deep";
import type { ReactNode, MouseEvent } from "react";
import { useCallback, useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import usePortal from "react-useportal";
import type { Store } from "redux";

import FadeIn from "animations/FadeIn";
import CharmIcon from "components/CharmIcon";
import Panel from "components/Panel";
import type { EntityDetailsRoute } from "components/Routes/Routes";
import SecretLabel from "components/secrets/SecretLabel";
import { isSet } from "components/utils";
import useAnalytics from "hooks/useAnalytics";
import useCanManageSecrets from "hooks/useCanManageSecrets";
import useInlineErrors, { type SetError } from "hooks/useInlineErrors";
import type { Config, ConfigData, ConfigValue } from "juju/api";
import { getApplicationConfig, setApplicationConfig } from "juju/api";
import { useListSecrets, useGrantSecret } from "juju/apiHooks";
import PanelInlineErrors from "panels/PanelInlineErrors";
import { usePanelQueryParams } from "panels/hooks";
import type { ConfirmTypes as DefaultConfirmTypes } from "panels/types";
import { ConfirmType as DefaultConfirmType } from "panels/types";
import bulbImage from "static/images/bulb.svg";
import boxImage from "static/images/no-config-params.svg";
import { actions as jujuActions } from "store/juju";
import { getModelSecrets, getModelByUUID } from "store/juju/selectors";
import { useAppStore, useAppSelector, useAppDispatch } from "store/store";

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
  GRANT_CANCEL_BUTTON = "No",
  GRANT_CONFIRM = "Grant secrets?",
  GRANT_CONFIRM_BUTTON = "Yes",
  GRANT_ERROR = "Unable to grant application access to secrets.",
  NONE = "This application doesn't have any configuration parameters",
  RESET_BUTTON = "Reset all values",
  SAVE_BUTTON = "Save and apply",
  SAVE_CONFIRM = "Are you sure you wish to apply these changes?",
  SAVE_CONFIRM_CANCEL_BUTTON = "Cancel",
  SAVE_CONFIRM_CONFIRM_BUTTON = "Yes, apply changes",
  GET_CONFIG_ERROR = "Unable to get application config.",
  SUBMIT_TO_JUJU_ERROR = "Unable to submit config changes to Juju.",
}

export enum TestId {
  PANEL = "config-panel",
}

enum InlineErrors {
  FORM = "form",
  GET_CONFIG = "get-config",
  SUBMIT_TO_JUJU = "submit-to-juju",
}

enum ConfigConfirmType {
  GRANT = "grant",
}

type ConfirmTypes = DefaultConfirmTypes | ConfigConfirmType;

type ConfigQueryParams = {
  panel: string | null;
  charm: string | null;
  entity: string | null;
  modelUUID: string | null;
};

const getRequiredGrants = (
  appName: string,
  config: Config,
  secrets?: ListSecretResult[] | null,
) => {
  const secretURIs = Object.values(config).reduce<string[]>((uris, entry) => {
    const value = entry.newValue ?? entry.value;
    if (
      value &&
      typeof value === "string" &&
      (entry.type === "secret" ||
        (entry.type === "string" && value.startsWith("secret:")))
    ) {
      uris.push(value);
    }
    return uris;
  }, []);
  return secrets
    ? secretURIs?.filter((secretURI) => {
        const secret = secrets.find(({ uri }) => uri === secretURI);
        const access = secret?.access?.find(
          (accessInfo) => accessInfo["target-tag"] === `application-${appName}`,
        );
        return !access;
      })
    : null;
};

export default function ConfigPanel(): JSX.Element {
  const dispatch = useAppDispatch();
  const reduxStore = useAppStore();
  const [config, setConfig] = useState<Config>({});
  const [selectedConfig, setSelectedConfig] = useState<ConfigData | undefined>(
    undefined,
  );
  const [enableSave, setEnableSave] = useState<boolean>(false);
  const [showResetAll, setShowResetAll] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [savingConfig, setSavingConfig] = useState<boolean>(false);
  const [confirmType, setConfirmType] = useState<ConfirmTypes>(null);
  const [inlineErrors, setInlineError] = useInlineErrors({
    [InlineErrors.GET_CONFIG]: (error) => (
      <>
        {error} Try{" "}
        <Button
          appearance="link"
          onClick={(event) => {
            event.stopPropagation();
            getConfigCallback();
          }}
        >
          refetching
        </Button>{" "}
        the config data.
      </>
    ),
  });
  const scrollArea = useRef<HTMLDivElement>(null);
  const sendAnalytics = useAnalytics();
  const { Portal } = usePortal();

  const defaultQueryParams: ConfigQueryParams = {
    panel: null,
    charm: null,
    entity: null,
    modelUUID: null,
  };
  const { userName, modelName } = useParams<EntityDetailsRoute>();
  const [queryParams, , handleRemovePanelQueryParams] =
    usePanelQueryParams<ConfigQueryParams>(defaultQueryParams);
  const { entity: appName, charm, modelUUID } = queryParams;
  const hasConfig = !isLoading && !!config && Object.keys(config).length > 0;
  const secrets = useAppSelector((state) => getModelSecrets(state, modelUUID));
  const wsControllerURL = useAppSelector((state) =>
    getModelByUUID(state, modelUUID),
  )?.wsControllerURL;
  const canManageSecrets = useCanManageSecrets();
  const grantSecret = useGrantSecret(userName, modelName);
  const listSecrets = useListSecrets(userName, modelName);

  useEffect(() => {
    listSecrets();
    return () => {
      if (!modelUUID || !wsControllerURL) {
        return;
      }
      dispatch(jujuActions.clearSecrets({ modelUUID, wsControllerURL }));
    };
  }, [dispatch, listSecrets, modelUUID, wsControllerURL]);

  const getConfigCallback = useCallback(() => {
    if (modelUUID && appName) {
      setIsLoading(true);
      getConfig(
        modelUUID,
        appName,
        reduxStore,
        setIsLoading,
        setConfig,
        checkAllDefaults,
        setInlineError,
      );
    }
  }, [appName, modelUUID, reduxStore, setInlineError]);

  useEffect(() => {
    getConfigCallback();
  }, [getConfigCallback]);

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
        newConfig[key].newValue !== newConfig[key].value,
    );
  }

  function handleSubmit() {
    setConfirmType(DefaultConfirmType.SUBMIT);
  }

  function handleCancel() {
    if (hasChangedFields(config)) {
      setConfirmType(DefaultConfirmType.CANCEL);
    } else {
      handleRemovePanelQueryParams();
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
      reduxStore.getState(),
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
      setInlineError(InlineErrors.FORM, errors);
      return;
    }
    sendAnalytics({
      category: "User",
      action: "Config values updated",
    });
    if (
      canManageSecrets &&
      getRequiredGrants(appName, config, secrets)?.length
    ) {
      setConfirmType(ConfigConfirmType.GRANT);
    } else {
      handleRemovePanelQueryParams();
    }
  }

  function generateConfirmationDialog(): JSX.Element | null {
    if (confirmType && appName) {
      const changedConfigList = generateChangedKeyValues(config);
      if (confirmType === DefaultConfirmType.SUBMIT) {
        // Render the submit confirmation modal.
        return (
          <Portal>
            <ConfirmationModal
              // Prevent clicks inside this panel from closing the parent panel.
              // This is handled in `checkCanClose`.
              className="prevent-panel-close"
              title={Label.SAVE_CONFIRM}
              confirmExtra={
                <p className="u-text--muted p-text--small u-align--left">
                  You can revert back to the applications default settings by
                  clicking the “Reset all values” button; or reset each edited
                  field by clicking “Use default”.
                </p>
              }
              cancelButtonLabel={Label.SAVE_CONFIRM_CANCEL_BUTTON}
              confirmButtonLabel={Label.SAVE_CONFIRM_CONFIRM_BUTTON}
              confirmButtonAppearance="positive"
              onConfirm={() => {
                setConfirmType(null);
                // Clear the form errors if there were any from a previous submit.
                setInlineError(InlineErrors.FORM, null);
                _submitToJuju().catch((error) => {
                  setInlineError(
                    InlineErrors.SUBMIT_TO_JUJU,
                    Label.SUBMIT_TO_JUJU_ERROR,
                  );
                  console.error(Label.SUBMIT_TO_JUJU_ERROR, error);
                });
              }}
              close={() => setConfirmType(null)}
            >
              <p>
                You have edited the following values to the {appName}{" "}
                configuration:
              </p>
              {changedConfigList}
            </ConfirmationModal>
          </Portal>
        );
      }
      if (confirmType === ConfigConfirmType.GRANT) {
        // Render the grant confirmation modal.
        const requiredGrants = getRequiredGrants(appName, config, secrets);
        return (
          <Portal>
            <ConfirmationModal
              // Prevent clicks inside this panel from closing the parent panel.
              // This is handled in `checkCanClose`.
              className="prevent-panel-close"
              title={Label.GRANT_CONFIRM}
              cancelButtonLabel={Label.GRANT_CANCEL_BUTTON}
              confirmButtonLabel={Label.GRANT_CONFIRM_BUTTON}
              confirmButtonAppearance="positive"
              onConfirm={() => {
                setConfirmType(null);
                // Clear the form errors if there were any from a previous submit.
                setInlineError(InlineErrors.FORM, null);
                if (!appName) {
                  return;
                }
                void (async () => {
                  try {
                    if (!requiredGrants) {
                      return;
                    }
                    for (const secretURI of requiredGrants) {
                      await grantSecret(secretURI, [appName]);
                    }
                    setConfirmType(null);
                    handleRemovePanelQueryParams();
                  } catch (error) {
                    setInlineError(
                      InlineErrors.SUBMIT_TO_JUJU,
                      Label.GRANT_ERROR,
                    );
                    console.error(Label.GRANT_ERROR, error);
                  }
                })();
              }}
              close={() => {
                setConfirmType(null);
                handleRemovePanelQueryParams();
              }}
            >
              <p>
                Would you like to grant access to this application for the
                following secrets?
              </p>
              <ul>
                {requiredGrants?.map((secretURI) => {
                  const secret = secrets?.find(({ uri }) => uri === secretURI);
                  return (
                    <li key={secretURI}>
                      {secret ? <SecretLabel secret={secret} /> : secretURI}
                    </li>
                  );
                })}
              </ul>
            </ConfirmationModal>
          </Portal>
        );
      }
      if (confirmType === "cancel") {
        // Render the cancel confirmation modal.
        return (
          <Portal>
            <ConfirmationModal
              className="prevent-panel-close"
              title={Label.CANCEL_CONFIRM}
              cancelButtonLabel={Label.CANCEL_CONFIRM_CANCEL_BUTTON}
              confirmButtonLabel={Label.CANCEL_CONFIRM_CONFIRM_BUTTON}
              onConfirm={() => {
                setConfirmType(null);
                handleRemovePanelQueryParams();
              }}
              close={() => setConfirmType(null)}
            >
              <p>
                You have edited the following values to the {appName}{" "}
                configuration:
              </p>
              {changedConfigList}
            </ConfirmationModal>
          </Portal>
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
        target.closest(".prevent-panel-close") ||
        target.closest(".p-panel")
      ) {
        return false;
      }
    }
    if (hasChangedFields(config)) {
      // They are trying to close the panel but the user has
      // unchanged values so show the confirmation dialog.
      setConfirmType(DefaultConfirmType.CANCEL);
      return false;
    }
    return true;
  }

  return (
    <Panel
      checkCanClose={checkCanClose}
      data-testid={TestId.PANEL}
      drawer={
        hasConfig ? (
          <>
            <Button onClick={handleCancel}>{Label.CANCEL_BUTTON}</Button>
            <Button
              appearance="positive"
              className={classnames("config-panel__save-button", {
                "is-active": savingConfig,
              })}
              onClick={handleSubmit}
              disabled={!enableSave || savingConfig}
            >
              {!savingConfig ? (
                Label.SAVE_BUTTON
              ) : (
                <>
                  <Spinner isLight />
                  <span>Saving&hellip;</span>
                </>
              )}
            </Button>
          </>
        ) : null
      }
      panelClassName="config-panel"
      isSplit={hasConfig}
      loading={isLoading}
      ref={scrollArea}
      title={
        <>
          {appName && charm ? (
            <CharmIcon name={appName} charmId={charm} />
          ) : null}{" "}
          {appName}
        </>
      }
      onRemovePanelQueryParams={handleRemovePanelQueryParams}
      splitContent={
        hasConfig ? (
          <div className="config-panel__description">
            {selectedConfig ? (
              <FadeIn key={selectedConfig.name} isActive={true}>
                <>
                  <h4 className="p-heading--5">Configuration description</h4>
                  <h5>{selectedConfig.name}</h5>
                  <pre>{selectedConfig.description}</pre>
                </>
              </FadeIn>
            ) : (
              <div className="u-align--center">
                <NoDescriptionMessage />
              </div>
            )}
          </div>
        ) : null
      }
    >
      <>
        {hasConfig && !isLoading ? (
          <>
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
              <PanelInlineErrors
                inlineErrors={inlineErrors}
                scrollArea={scrollArea.current}
              />
              {generateConfigElementList(
                config,
                selectedConfig,
                setSelectedConfig,
                setNewValue,
              )}
            </div>
            {generateConfirmationDialog()}
          </>
        ) : (
          <FadeIn isActive={true} className="u-align--center">
            <PanelInlineErrors
              inlineErrors={inlineErrors}
              scrollArea={scrollArea.current}
            />
            <NoConfigMessage />
          </FadeIn>
        )}
      </>
    </Panel>
  );
}

function getConfig(
  modelUUID: string,
  appName: string,
  reduxStore: Store,
  setIsLoading: (value: boolean) => void,
  setConfig: (value: Config) => void,
  checkAllDefaults: (value: Config) => void,
  setInlineError: SetError,
) {
  getApplicationConfig(modelUUID, appName, reduxStore.getState())
    .then((result) => {
      // Add the key to the config object to make for easier use later.
      const config: Config = {};
      // The config param can be null.
      Object.keys(result?.config ?? {}).forEach((key) => {
        config[key] = result?.config[key];
        config[key].name = key;
      });
      setConfig(config);
      checkAllDefaults(config);
      setInlineError(InlineErrors.GET_CONFIG, null);
      return;
    })
    .catch((error) => {
      setInlineError(InlineErrors.GET_CONFIG, Label.GET_CONFIG_ERROR);
      console.error(Label.GET_CONFIG_ERROR, error);
    })
    .finally(() => setIsLoading(false));
}

function generateConfigElementList(
  configs: Config,
  selectedConfig: ConfigData | undefined,
  setSelectedConfig: SetSelectedConfig,
  setNewValue: SetNewValue,
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
          </div>,
        );
      }
      return accumulator;
    },
    [],
  );
  return changedValues;
}

function NoConfigMessage() {
  return (
    <div className="config-panel__message">
      <img src={boxImage} alt="" />
      <h4>{Label.NONE}</h4>
    </div>
  );
}

function NoDescriptionMessage() {
  return (
    <div className="config-panel__message">
      <img src={bulbImage} alt="" />
      <h4>
        Click on a configuration row to view its related description and
        parameters
      </h4>
    </div>
  );
}
