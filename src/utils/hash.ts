/**
 * Create a stable hash for some object, when compared against objects of the same type.
 */
export function hash(item: unknown): string {
  switch (typeof item) {
    case "string":
      return btoa(`"${item}"`);
    case "number":
    case "bigint":
    case "boolean":
      return btoa(item.toString());
    case "undefined":
      return btoa("undefined");
    case "object":
      if (item === null) {
        return btoa("null");
      } else if (Array.isArray(item)) {
        // eslint-disable-next-line @typescript-eslint/no-use-before-define
        return hashArray(item);
      } else {
        // eslint-disable-next-line @typescript-eslint/no-use-before-define
        return hashObject(item);
      }
    default:
      console.error("non-hashable item", item);
      throw new Error("could not hash item");
  }
}

function hashArray(array: unknown[]): string {
  return btoa(array.map(hash).join(";"));
}

function hashObject(object: object): string {
  return btoa(
    Object.entries(object)
      // Ensure keys are sorted.
      .sort(([keyA, _valueA], [keyB, _valueB]) =>
        keyA === keyB ? 0 : keyA < keyB ? -1 : 1,
      )
      .map(([key, value]) => {
        return `${hash(key)}:${hash(value)}`;
      })
      .join(";"),
  );
}
