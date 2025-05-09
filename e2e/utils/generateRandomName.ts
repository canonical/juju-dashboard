export const generateRandomName = (prefix: string) =>
  `${prefix}${new Date().getTime()}${Math.floor(Math.random() * 10000)}`;
