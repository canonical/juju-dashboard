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

type SetError = (key: InlineError["key"], error: InlineError["error"]) => void;

type HasError = (key: InlineError["key"]) => boolean;

function useInlineErrors(
  mapping?: ErrorMapping,
): [ReactNode[], SetError, HasError] {
  const [inlineErrors, setInlineErrors] = useState<InlineError[]>([]);
  const setError = useCallback(
    (key: InlineError["key"], error: InlineError["error"]) => {
      setInlineErrors((inlineErrors) => {
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
  const hasInlineError = useCallback(
    (key: InlineError["key"]) =>
      !!inlineErrors.find(
        (inlineError) => inlineError.key === key && !!inlineError.error,
      ),
    [inlineErrors],
  );
  const errors = inlineErrors.reduce<ReactNode[]>((nodes, { key, error }) => {
    if (error) {
      nodes.push(mapping && key in mapping ? mapping[key](error) : error);
    }
    return nodes;
  }, []);
  return [errors, setError, hasInlineError];
}

export default useInlineErrors;
