import type {
  Action,
  ActionMessage,
  ActionResult,
  ActionResults,
  AdditionalProperties,
  ApplicationCharmActionsResult,
  ApplicationsCharmActionsResults,
  Error as ActionError,
  OperationResult,
  OperationResults,
} from "@canonical/jujulib/dist/api/facades/action/ActionV7";
import { Factory } from "fishery";

export const errorFactory = Factory.define<ActionError>(() => ({
  code: "1",
  message: "error",
}));

export const actionFactory = Factory.define<Action>(() => ({
  name: "list-disks",
  receiver: "unit-easyrsa-0",
  tag: "action-2",
}));

export const actionMessageFactory = Factory.define<ActionMessage>(() => ({
  timestamp: "2021-04-14T20:27:57Z",
  message: "log message",
}));

export const actionResultFactory = Factory.define<ActionResult>(() => ({
  action: actionFactory.build(),
  completed: "2021-04-14T20:27:57Z",
  enqueued: "2021-04-14T20:27:56Z",
  error: errorFactory.build(),
  log: [],
  message: "completed",
  output: {},
  started: "2021-04-14T20:27:57Z",
  status: "completed",
}));

export const actionResultsFactory = Factory.define<ActionResults>(() => ({
  results: [],
}));

export const operationResultFactory = Factory.define<OperationResult>(() => ({
  actions: [],
  completed: "2021-04-14T20:27:57Z",
  enqueued: "2021-04-14T20:27:56Z",
  operation: "operation-1",
  started: "2021-04-14T20:27:57Z",
  status: "completed",
  summary: "list-disks run on unit-easyrsa/0,unit-easyrsa/1",
}));

export const operationResultsFactory = Factory.define<OperationResults>(() => ({
  results: [],
  truncated: false,
}));

export const applicationCharmActionParamsFactory =
  Factory.define<AdditionalProperties>(() => ({
    additionalProperties: false,
    description: "Add disk(s) to Ceph",
    properties: {},
    required: [],
    title: "add-disk",
    type: "object",
  }));

export const applicationCharmActionFactory =
  Factory.define<AdditionalProperties>(() => ({
    description: "Add disk(s) to Ceph",
    params: {},
  }));

export const applicationCharmActionsResultFactory =
  Factory.define<ApplicationCharmActionsResult>(() => ({
    actions: {},
    "application-tag": "application-ceph",
    error: errorFactory.build(),
  }));

export const applicationsCharmActionsResultsFactory =
  Factory.define<ApplicationsCharmActionsResults>(() => ({
    results: [],
  }));
