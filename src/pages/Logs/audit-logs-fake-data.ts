import { Factory } from "fishery";

// TODO: this file should be removed once the audit log endpoint is available on
// the JIMM facade.

// This type is based on https://github.com/canonical/jimm/blob/feature-rebac/api/params/params.go#L92.
export type AuditEvent = {
  time: string;
  "conversation-id": string;
  "message-id": number;
  "facade-name": string;
  "facade-method": string;
  "facade-version": number;
  "object-id": string;
  "user-tag": string;
  model: string;
  "is-response": boolean;
  params: unknown;
  errors: unknown;
};

const fakeFacades = [
  "ActionV7",
  "AllWatcherV3",
  "AnnotationsV2",
  "ApplicationV18",
  "CharmsV6",
  "ClientV6",
  "CloudV7",
  "ControllerV9",
  "ModelManagerV9",
  "PingerV1",
];

const fakeMethods = [
  "CreateModel",
  "DestroyModels",
  "DumpModels",
  "DumpModelsDB",
  "ListModelSummaries",
  "ListModels",
  "ModelDefaults",
  "ModelInfo",
  "ModelStatus",
  "ModifyModelAccess",
  "SetModelDefaults",
  "UnsetModelDefaults",
  "ValidateModelUpgrades",
];

const fakeUsers = [
  "user-bob",
  "user-sally",
  "user-richard",
  "user-simon",
  "user-hannah",
];

const fakeModels = ["test", "production", "qa", "staging"];

export const auditEventFactory = Factory.define<AuditEvent>(({ sequence }) => ({
  time: new Date().toISOString(),
  "conversation-id": sequence.toString(),
  "message-id": sequence,
  "facade-name": fakeFacades[Math.floor(fakeFacades.length * Math.random())],
  "facade-method": fakeMethods[Math.floor(fakeMethods.length * Math.random())],
  "facade-version": sequence,
  "object-id": sequence.toString(),
  "user-tag": fakeUsers[Math.floor(fakeUsers.length * Math.random())],
  model: fakeModels[Math.floor(fakeModels.length * Math.random())],
  "is-response": true,
  params: null,
  errors: null,
}));

export const generateFakeAuditLogs = (length?: number) => {
  const events: AuditEvent[] = [];
  const count = length !== undefined ? length : Math.random() * 50;
  for (let index = 0; index < count; index++) {
    events[index] = auditEventFactory.build();
  }
  return events;
};
