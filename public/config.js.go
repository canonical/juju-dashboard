var jujuDashboardConfig = {
  // API host to allow app to connect and retrieve models. This address should
  // begin with `ws://` or `wss://` and end with `/api`
  baseControllerURL: null,
  // Configurable base url to allow deploying to different paths.
  baseAppURL: "{{.baseAppURL}}",
  // The URL of the third party identity provider.
  identityProviderURL: {{.identityProviderURL}},
  // Is this application being rendered in Juju and not JAAS. This flag should
  // only be used for superficial updates like logos. Use feature detection
  // for other environment features.
  isJuju: {{.isJuju}},
  // If true, then Google Analytics and Sentry data will be sent.
  analyticsEnabled: {{.analyticsEnabled}},
};
