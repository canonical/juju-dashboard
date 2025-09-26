import type { DestroyModelErrors } from "juju/types";

export default function isDestroyModelErrors(
  errors: unknown,
): errors is DestroyModelErrors {
  return (
    Array.isArray(errors) &&
    errors.every(
      (error) =>
        Array.isArray(error) &&
        error.length === 2 &&
        typeof error[0] === "string" &&
        typeof error[1] === "string",
    )
  );
}
