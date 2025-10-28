import type { ActionSpec } from "@canonical/jujulib/dist/api/facades/action/ActionV7";

export enum Label {
  NO_UNITS_SELECTED = "0 units selected",
  NO_ACTIONS_PROVIDED = "This charm has not provided any actions.",
  GET_ACTIONS_ERROR = "Unable to get actions for application.",
}

export enum TestId {
  PANEL = "actions-panel",
  UNIT_LIST = "actions-panel-unit-list",
}

export type ActionData = Record<string, ActionSpec>;

export type ActionParams = {
  description: string;
  properties: ActionProps;
  required?: string[];
  title: string;
  type: string;
};

export type ActionProps = {
  [key: string]: ActionProp;
};

export type ActionProp = {
  description: string;
  type: string;
};

export type ActionOptionsType = ActionOptionDetails[];

export type ActionOptionDetails = {
  name: string;
  description: string;
  type: string;
  required: boolean;
};

export type ActionOptionValues = {
  [actionName: string]: ActionOptionValue;
};

export type ActionOptionValue = {
  [optionName: string]: string;
};

export type OnValuesChange = (
  actionName: string,
  options: ActionOptionValue,
) => void;

export enum InlineErrors {
  GET_ACTION = "get-action",
  EXECUTE_ACTION = "execute-action",
}
