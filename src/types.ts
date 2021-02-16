export type TSFixMe = any;

export type UIState = {
  confirmationModalActive: boolean;
  userMenuActive: boolean;
  togglePanel: string;
};

export type ReduxState = {
  root: TSFixMe;
  juju: TSFixMe;
  ui: UIState;
};
