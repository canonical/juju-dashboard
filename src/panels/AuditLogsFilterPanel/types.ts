export type FormFields = {
  after: string;
  before: string;
  user: string;
  model: string;
  method: string;
};

export enum Label {
  CLEAR = "Clear",
  FILTER = "Filter",
}

export enum TestId {
  PANEL = "audit-logs-filter-panel",
}
