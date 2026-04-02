// Regex to extract the third number:
const versionRegex = /(?<=^\d+\.\d+\.)\d+/;
const getPatchVersion = (version?: string): null | number => {
  const patch = Number(versionRegex.exec(version ?? "")?.[0]);
  return Number.isNaN(patch) ? null : patch;
};

export default getPatchVersion;
