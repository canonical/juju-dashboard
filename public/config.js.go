var jujuDashboardConfig = {
  // API host to allow app to connect and retrieve models. This address should
  // begin with `ws://` or `wss://` and end with `/api`
  baseControllerURL: null,
  // Configurable base url to allow deploying to different paths.
  baseAppURL: "{{.baseAppURL}}",
  // If true then identity will be provided by a third party provider.
  identityProviderAvailable: {{.identityProviderAvailable}},
  // Is this application being rendered in Juju and not JAAS. This flag should
  // only be used for superficial updates like logos. Use feature detection
  // for other environment features.
  isJuju: {{.isJuju}},
};
