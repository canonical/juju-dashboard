import { ActionButton, Button } from "@canonical/react-components";
import type { FormikProps } from "formik";
import type { JSX, ReactNode } from "react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import CharmIcon from "components/CharmIcon";
import LoadingHandler from "components/LoadingHandler";
import Panel from "components/Panel";
import { useModelAppParams } from "components/hooks";
import useInlineErrors from "hooks/useInlineErrors";
import { useGetActionsForApplication } from "juju/api-hooks";
import PanelInlineErrors from "panels/PanelInlineErrors";
import { usePanelQueryParams } from "panels/hooks";
import { ConfirmType, type ConfirmTypes } from "panels/types";
import { getModelUUID } from "store/juju/selectors";
import { pluralize } from "store/juju/utils/models";
import type { RootState } from "store/store";
import { useAppStore, useAppSelector } from "store/store";
import { testId } from "testing/utils";
import { logger } from "utils/logger";

import ActionsList from "./ActionsList";
import ConfirmationDialog from "./ConfirmationDialog";
import type { ActionData } from "./types";
import { InlineErrors, Label, TestId } from "./types";

type ActionsQueryParams = {
  panel?: null | string;
  units?: string[];
};

export default function ActionsPanel(): JSX.Element {
  const appStore = useAppStore();
  const appState = appStore.getState();
  const { appName, modelName, userName } = useModelAppParams();
  const modelUUID = useAppSelector((state: RootState) =>
    getModelUUID(state, modelName),
  );
  const [actionData, setActionData] = useState<ActionData>({});
  const [fetchingActionData, setFetchingActionData] = useState(false);
  const [confirmType, setConfirmType] = useState<ConfirmTypes>(null);
  const getActionsForApplication = useGetActionsForApplication(
    userName,
    modelName,
  );
  const [inlineErrors, setInlineErrors, hasInlineError] = useInlineErrors({
    [InlineErrors.GET_ACTION]: (error) => (
      // If get actions for application fails, we add a button for
      // refetching the actions data to the first inline error.
      <>
        {error} Try{" "}
        <Button
          appearance="link"
          onClick={() => {
            // There's a circular dependency here that gets resolved at runtime that
            // requires this function call to occur before the getCharmsURL callback is defined.
            // eslint-disable-next-line @typescript-eslint/no-use-before-define
            getActionsForApplicationCallback();
          }}
        >
          refetching
        </Button>{" "}
        the actions data.
      </>
    ),
  });
  const [isExecutingAction, setIsExecutingAction] = useState<boolean>(false);
  const scrollArea = useRef<HTMLDivElement>(null);

  const defaultQueryParams: ActionsQueryParams = { panel: null, units: [] };
  const [queryParams, , handleRemovePanelQueryParams] =
    usePanelQueryParams<ActionsQueryParams>(defaultQueryParams);
  const selectedUnits = useMemo(
    () => queryParams.units ?? [],
    [queryParams.units],
  );

  const getActionsForApplicationCallback = useCallback(() => {
    setFetchingActionData(true);
    if (appName && modelUUID) {
      getActionsForApplication(appName)
        .then((actions) => {
          if (actions?.results?.[0]?.actions) {
            setActionData(actions.results[0].actions);
          }
          setInlineErrors(InlineErrors.GET_ACTION, null);
          return;
        })
        .catch((error) => {
          setInlineErrors(InlineErrors.GET_ACTION, Label.GET_ACTIONS_ERROR);
          logger.error(Label.GET_ACTIONS_ERROR, error);
        })
        .finally(() => {
          setFetchingActionData(false);
        });
    }
  }, [appName, getActionsForApplication, modelUUID, setInlineErrors]);

  useEffect(() => {
    getActionsForApplicationCallback();
  }, [getActionsForApplicationCallback]);

  const namespace =
    appName && modelUUID
      ? appState.juju?.modelData?.[modelUUID]?.applications?.[appName]?.charm
      : null;

  const generateSelectedUnitList = useCallback(() => {
    if (!selectedUnits.length) {
      return Label.NO_UNITS_SELECTED;
    }
    return selectedUnits.reduce((acc, unitName) => {
      return `${acc}, ${unitName.split("/")[1]}`;
    });
  }, [selectedUnits]);

  const generateTitle = (): ReactNode => {
    const unitLength = selectedUnits.length;
    return (
      <>
        {appName && namespace ? (
          <CharmIcon name={appName} charmId={namespace} />
        ) : null}{" "}
        {unitLength} {pluralize(unitLength, "unit")} selected
      </>
    );
  };

  const [validAction, setValidAction] = useState<boolean>(false);
  const [pendingAction, setPendingAction] = useState<{
    name: string;
    properties: Record<string, string>;
  } | null>(null);
  const actionFormRef = useRef<FormikProps<Record<string, string>>>(null);

  function handleSubmit(
    name: string,
    properties: Record<string, boolean | string>,
  ): void {
    setPendingAction({
      name,
      properties: Object.fromEntries(
        Object.entries(properties).map(([key, value]) => [
          key,
          value.toString(),
        ]),
      ),
    });
    setConfirmType(ConfirmType.SUBMIT);
  }

  function submitSelectedAction(): void {
    // Trigger the corresponding `handleSubmit` by submitting the underlying form.
    void actionFormRef.current?.submitForm();
  }

  const data = Object.keys(actionData).length > 0 ? actionData : null;

  return (
    <Panel
      drawer={
        <ActionButton
          appearance="positive"
          loading={isExecutingAction}
          disabled={
            !validAction || isExecutingAction || selectedUnits.length === 0
          }
          onClick={submitSelectedAction}
        >
          Run action
        </ActionButton>
      }
      width="narrow"
      {...testId(TestId.PANEL)}
      title={generateTitle()}
      onRemovePanelQueryParams={handleRemovePanelQueryParams}
      ref={scrollArea}
    >
      <PanelInlineErrors
        inlineErrors={inlineErrors}
        scrollArea={scrollArea.current}
      />
      <p {...testId(TestId.UNIT_LIST)}>
        Run action on: {generateSelectedUnitList()}
      </p>
      <LoadingHandler
        hasData={!!data}
        loading={fetchingActionData}
        noDataMessage={
          hasInlineError(InlineErrors.GET_ACTION)
            ? ""
            : Label.NO_ACTIONS_PROVIDED
        }
      >
        <ActionsList
          actions={actionData}
          onValidate={setValidAction}
          onSubmit={handleSubmit}
          formControlRef={actionFormRef}
        />
      </LoadingHandler>
      {pendingAction && confirmType ? (
        <ConfirmationDialog
          confirmType={confirmType}
          selectedAction={pendingAction.name}
          selectedUnits={selectedUnits}
          setConfirmType={setConfirmType}
          setIsExecutingAction={setIsExecutingAction}
          selectedActionOptionValue={pendingAction.properties}
          handleRemovePanelQueryParams={handleRemovePanelQueryParams}
          setInlineErrors={setInlineErrors}
        />
      ) : null}
    </Panel>
  );
}
