export enum TestId {
  PANEL = "upgrade-model-panel",
}

export type QueryParams = {
  panel: null | string;
  qualifier: null | string;
  modelName: null | string;
};

// TODO: this type should come from the JIMM facade once the real API data is available: https://warthogs.atlassian.net/browse/JUJU-9499.
export type Version = {
  date: string;
  lts: boolean;
  version: string;
  "link-to-release": string;
  "requires-migration": boolean;
};
