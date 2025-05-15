export enum ErrorResponse {
  INVALID_TAG = '"user-" is not a valid user tag',
  INVALID_FIELD = "invalid entity name or password",
}

export enum Label {
  AUTHENTICATE = "Authenticate",
  AUTH_REQUIRED = "Controller authentication required",
  INVALID_NAME = "Invalid user name",
  INVALID_FIELD = "Invalid user name or password",
  POLLING_ERROR = "Error when trying to connect and start polling models.",
  LOGIN_TO_DASHBOARD = "Log in to the dashboard",
  LOADING = "Connecting...",
}

export enum TestId {
  LOGIN_FORM = "login-form",
}
