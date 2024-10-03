const jimmEndpoint =
  window.jujuDashboardConfig?.controllerAPIEndpoint
    .replace("wss://", "https://")
    .replace("ws://", "http://")
    .replace(/\/api$/, "") ?? "";

export const endpoints = {
  login: `${jimmEndpoint}/auth/login`,
  logout: `${jimmEndpoint}/auth/logout`,
  whoami: `${jimmEndpoint}/auth/whoami`,
};
