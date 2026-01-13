export const parseMachineHardware = (
  hardware?: null | string,
): Record<string, string> => {
  return (
    hardware
      ?.split(" ")
      .reduce<Record<string, string>>((attributes, attribute) => {
        const [key, value] = attribute.split("=");
        attributes[key] = value;
        return attributes;
      }, {}) ?? {}
  );
};
