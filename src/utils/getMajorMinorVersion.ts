const getMajorMinorVersion = (version?: string): number => {
  // Regex to extract the first two numbers:
  const versionRegex = /^\d+\.\d+/g;
  return Number(versionRegex.exec(version ?? "")?.[0]);
};

export default getMajorMinorVersion;
