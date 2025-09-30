export const generateRandomName = (prefix: string): string =>
  `${prefix}${new Date().getTime()}${Math.floor(Math.random() * 10000)}`;
