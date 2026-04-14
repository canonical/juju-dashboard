// Regex to extract the first two numbers:
const versionRegex = /^\d+\.\d+/;
const getMajorMinorVersion = (version?: string): null | number => {
  const majorMinor = Number(versionRegex.exec(version ?? "")?.[0]);
  return Number.isNaN(majorMinor) ? null : majorMinor;
};

export default getMajorMinorVersion;
