export const endpoints = () => {
  const jimmEndpoint =
    window.jujuDashboardConfig?.controllerAPIEndpoint
      .replace("wss://", "https://")
      .replace("ws://", "http://")
      .replace(/\/api$/, "") ?? "";
  return {
    login: `${jimmEndpoint}/auth/login`,
    logout: `${jimmEndpoint}/auth/logout`,
    rebac: `${jimmEndpoint}/rebac/v1`,
    whoami: `${jimmEndpoint}/auth/whoami`,
  };
};
