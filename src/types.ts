export type TSFixMe = any;

export type UIState = {
  confirmationModalActive: boolean;
  userMenuActive: boolean;
  sideNavCollapsed: boolean;
};

export type ReduxState = {
  root: TSFixMe;
  juju: TSFixMe;
  ui: UIState;
};
