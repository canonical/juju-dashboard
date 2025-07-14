// If a new key is added to this config then be sure to also add the key and
// value to the golang template in config.js.go and to the Web Team's demo
// config in config.demo.js.
// eslint-disable-next-line no-unused-vars
var jujuDashboardConfig = {
  // API host to allow app to connect and retrieve models. This address should
  // begin with `ws://` or `wss://` and end with `/api`.
  controllerAPIEndpoint: "",
  // Configurable base url to allow hosting the dashboard at different paths.
  baseAppURL: "/",
  // The URL of the third party identity provider. This is typically provided
  // by the controller when logging in so it's not currently used directly.
  // But it is available in the charm so putting it here in the event that we
  // would like to use it in the future.
  identityProviderURL: "",
  // Is this application being rendered in Juju and not JAAS. This flag should
  // only be used for superficial updates like logos. Use feature detection
  // for other environment features.
  isJuju: false,
  // If true, then Google Analytics and Sentry data will be sent.
  analyticsEnabled: true,
};
