/**
 * Filter an array for only values that are truthy and narrow the type.
 * This is required because .filter(Boolean) does not narrow the type.
 */
const filterBoolean = <I>(array: (I | null | undefined)[]): I[] =>
  array.filter(Boolean) as I[];

export default filterBoolean;
