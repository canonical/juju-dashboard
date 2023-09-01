const getUserName = (userNameWithPrefix: string): string =>
  userNameWithPrefix.replace("user-", "");

export default getUserName;
