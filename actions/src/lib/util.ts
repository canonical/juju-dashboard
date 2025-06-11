/**
 * Split a string once at a seperator. If there isn't one instance of the seperator, an error will
 * be raised.
 */
export function splitOnce(
  str: string,
  sep: string,
  allowEmpty: boolean = true,
): [string, string] {
  const parts = str.split(sep);

  if (
    parts.length !== 2 ||
    (!allowEmpty && !parts.every((part) => part.length > 0))
  ) {
    throw new Error(
      `expected split to produce 2 items, but found ${parts.length}`,
    );
  }

  return [parts[0], parts[1]];
}
