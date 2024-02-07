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

type HasError = (key: InlineError["key"]) => boolean;

function useInlineErrors(
  mapping?: ErrorMapping,
): [ReactNode[], SetError, HasError] {
  const [inlineErrors, setInlineErrors] = useState<InlineError[]>([]);
  const setError = useCallback(
    (key: InlineError["key"], error: InlineError["error"]) => {
      setInlineErrors((prevInlineErrors) => {
        const inlineErrors = cloneDeep(prevInlineErrors);
        const existing = inlineErrors.find(
          (inlineError) => inlineError.key === key,
        );
        if (!existing) {
          inlineErrors.push({ key, error });
        } else {
          existing.error = error;
        }
        return inlineErrors;
      });
    },
    [],
  );
  const hasError = useCallback(
    (key: InlineError["key"]) =>
      !!inlineErrors.find(
        (inlineError) =>
          inlineError.key === key &&
          (Array.isArray(inlineError.error)
            ? inlineError.error.some(Boolean)
            : !!inlineError.error),
      ),
    [inlineErrors],
  );
  const errors = inlineErrors.reduce<ReactNode[]>((nodes, { key, error }) => {
    const errorItems = mapping && key in mapping ? mapping[key](error) : error;
    const filteredErrorItems = (
      Array.isArray(errorItems) ? errorItems : [errorItems]
    ).filter(Boolean);
    return nodes.concat(filteredErrorItems);
  }, []);
  return [errors, setError, hasError];
}

export default useInlineErrors;
