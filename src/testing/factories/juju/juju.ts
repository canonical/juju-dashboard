import { Factory } from "fishery";

import { DEFAULT_AUDIT_EVENTS_LIMIT } from "store/juju/slice";
import type {
  AddModelState,
  AuditEventsState,
  CloudState,
  CommandHistory,
  Controller,
  ControllerLocation,
  CrossModelQueryState,
  HistoryItem,
  JujuState,
  ModelData,
  ModelFeatures,
  ModelFeaturesState,
  ModelListInfo,
  ModelMigrationTargetsState,
  ModelSecrets,
  ModelUpgrade,
  ReBACState,
  SecretsState,
  SupportedJujuVersionsState,
  UserCredentialsState,
} from "store/juju/types";
import type { SecretsContent } from "store/juju/types";

import { modelStatusInfoFactory } from "./ClientV8";
import { modelInfoFactory } from "./ModelManagerV11";

function generateUUID(): string {
  // spell-checker:disable-next-line
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (char) => {
    const num = (Math.random() * 16) | 0;
    const value = char === "x" ? num : (num & 0x3) | 0x8;
    return value.toString(16);
  });
}

export const controllerLocationFactory = Factory.define<ControllerLocation>(
  () => ({
    region: "aws",
  }),
);

export const controllerFactory = Factory.define<Controller>(() => ({
  path: "admin/jaas",
  // spell-checker:disable-next-line
  uuid: "a030379a-940f-4760-8fcf-3062bfake4e7",
  version: "1.2.3",
}));

export const controllerInfoFactory = Factory.define<Controller>(() => ({
  "agent-version": "1.2.3",
  name: "controller1",
  status: {
    status: "available",
    info: "",
    since: "2021-07-28T22:05:36.877177235Z",
  },
  username: "eggman@external",
  uuid: "def456",
}));

export const modelListInfoFactory = Factory.define<ModelListInfo>(() => ({
  name: "test-model",
  qualifier: "user-eggman@external",
  type: "iaas",
  // spell-checker:disable-next-line
  uuid: "84e872ff-9171-46be-829b-70f0ffake18d",
  wsControllerURL: "wss://example.com/api",
}));

export const modelDataFactory = Factory.define<ModelData>(() => ({
  applications: {},
  machines: {},
  model: modelStatusInfoFactory.build(),
  offers: {},
  relations: [],
  uuid: generateUUID(),
  info: modelInfoFactory.build(),
  "remote-applications": {},
}));

export const auditEventsStateFactory = Factory.define<AuditEventsState>(() => ({
  items: null,
  errors: null,
  loaded: false,
  loading: false,
  limit: DEFAULT_AUDIT_EVENTS_LIMIT,
}));

export const crossModelQueryStateFactory = Factory.define<CrossModelQueryState>(
  () => ({
    results: null,
    errors: null,
    loaded: false,
    loading: false,
  }),
);

export const modelSecretsContentFactory = Factory.define<SecretsContent>(
  () => ({
    content: null,
    errors: null,
    loaded: false,
    loading: false,
  }),
);

export const modelSecretsFactory = Factory.define<ModelSecrets>(() => ({
  items: null,
  errors: null,
  loaded: false,
  loading: false,
}));

export const secretsStateFactory = Factory.define<SecretsState>(() => ({}));

export const userCredentialsStateFactory = Factory.define<UserCredentialsState>(
  () => ({
    credentials: {},
    errors: null,
    loading: false,
  }),
);

export const cloudInfoStateFactory = Factory.define<CloudState>(() => ({
  clouds: null,
  errors: null,
  loading: false,
}));

export const addModelStateFactory = Factory.define<AddModelState>(() => ({
  loaded: false,
  loading: false,
}));

export const modelFeaturesFactory = Factory.define<ModelFeatures>(() => ({}));

export const modelFeaturesStateFactory = Factory.define<ModelFeaturesState>(
  () => ({}),
);

export const modelUpgradeFactory = Factory.define<ModelUpgrade>(() => ({
  currentVersion: "1.2.3",
  upgradeVersion: "3.2.1",
}));

export const rebacState = Factory.define<ReBACState>(() => ({
  allowed: [],
  relationships: [],
}));

export const commandHistoryItem = Factory.define<HistoryItem>(() => ({
  command: "status",
  messages: [],
}));

export const commandHistoryState = Factory.define<CommandHistory>(() => ({}));

export const supportedJujuVersionsStateFactory =
  Factory.define<SupportedJujuVersionsState>(() => ({
    data: null,
    error: null,
    loading: false,
  }));

export const modelMigrationTargetsStateFactory =
  Factory.define<ModelMigrationTargetsState>(() => ({}));

export const jujuStateFactory = Factory.define<JujuState>(() => ({
  auditEvents: auditEventsStateFactory.build(),
  crossModelQuery: crossModelQueryStateFactory.build(),
  commandHistory: commandHistoryState.build(),
  controllers: null,
  models: {},
  destroyModel: {},
  modelsLoaded: false,
  modelsError: null,
  modelData: {},
  modelFeatures: {},
  modelListLoading: {},
  modelUpgrade: {},
  charms: [],
  rebac: rebacState.build(),
  secrets: {},
  cloudInfo: cloudInfoStateFactory.build(),
  userCredentials: userCredentialsStateFactory.build(),
  selectedApplications: {},
  supportedJujuVersions: supportedJujuVersionsStateFactory.build(),
  modelMigrationTargets: modelMigrationTargetsStateFactory.build(),
  addModelState: addModelStateFactory.build(),
  blockState: {},
}));
