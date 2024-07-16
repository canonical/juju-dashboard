export const DARK_THEME = true;

// The date format used in datetime-local fields.
export const DATETIME_LOCAL = "yyyy-MM-dd'T'HH:mm";

// The interval at which the OIDC whoami endpoint is polled at (in milliseconds).
// This is set to 5 minutes as that is how long a token is valid for in JIMM, so
// if access is revoked this will poll and delete the cookie.
export const OIDC_POLL_INTERVAL = 5 * 60 * 1000;
