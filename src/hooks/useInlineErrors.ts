import cloneDeep from "clone-deep";
import type { ReactNode } from "react";
import { useCallback, useState } from "react";

type InlineError = {
  key: string;
  error: ReactNode;
};

type ErrorMapping = Record<
  InlineError["key"],
  (error: InlineError["error"]) => ReactNode
>;

export type SetError = (
  key: InlineError["key"],
  error: InlineError["error"],
) => void;

type HasError = (key?: InlineError["key"]) => boolean;

function useInlineErrors(
  mapping?: ErrorMapping,
): [ReactNode[], SetError, HasError] {
  const [inlineErrors, setInlineErrors] = useState<InlineError[]>([]);
  const setError = useCallback(
    (key: InlineError["key"], error: InlineError["error"]) => {
      setInlineErrors((prevInlineErrors) => {
        const errors = cloneDeep(prevInlineErrors);
        const existing = errors.find((inlineError) => inlineError.key === key);
        if (!existing) {
          errors.push({ key, error });
        } else {
          existing.error = error;
        }
        return errors;
      });
    },
    [],
  );
  const hasError = useCallback(
    (key?: InlineError["key"]) => {
      const hasIndividualError = (inlineError: InlineError): boolean =>
        Array.isArray(inlineError.error)
          ? inlineError.error.some(Boolean)
          : !!inlineError.error;
      return key
        ? !!inlineErrors.find(
            (inlineError) =>
              inlineError.key === key && hasIndividualError(inlineError),
          )
        : inlineErrors.some(hasIndividualError);
    },
    [inlineErrors],
  );
  const errors = inlineErrors.reduce<ReactNode[]>((nodes, { key, error }) => {
    const errorItems =
      error && mapping && key in mapping ? mapping[key](error) : error;
    const filteredErrorItems = (
      Array.isArray(errorItems) ? errorItems : [errorItems]
    ).filter(Boolean);
    return nodes.concat(filteredErrorItems);
  }, []);
  return [errors, setError, hasError];
}

export default useInlineErrors;
