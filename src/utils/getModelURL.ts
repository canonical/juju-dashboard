const getModelURL = (wsControllerURL: string, modelUUID: string): string =>
  wsControllerURL.replace("/api", `/model/${modelUUID}/api`);

export default getModelURL;
