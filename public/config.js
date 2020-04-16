// If a new key is added to this config then be sure to also add the key and
// value to the golang template in config.js.go.
// eslint-disable-next-line no-unused-vars
var jaasDashboardConfig = {
  // API host to allow app to connect and retrieve models
  baseControllerURL: "jimm.jujucharms.com",
  // Configurable base url to allow deploying to different paths.
  baseAppURL: "/",
  // If true then identity will be provided by a third party provider.
  identityProviderAvailable: true,
  // Is this application being rendered in Juju and not JAAS. This flag should
  // only be used for superficial updates like logos. Use feature detection
  // for other environment features.
  isJuju: false,
};
