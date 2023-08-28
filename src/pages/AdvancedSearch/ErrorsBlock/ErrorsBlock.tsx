import { isEqual } from "lodash";

import type { CrossModelQueryResponse } from "juju/jimm-facade";
import {
  getCrossModelQueryErrors,
  getCrossModelQueryLoading,
} from "store/juju/selectors";
import { useAppSelector } from "store/store";

import "./_errors-block.scss";
import CodeSnippetBlock from "../CodeSnippetBlock/CodeSnippetBlock";

const ErrorsBlock = (): JSX.Element | null => {
  const isCrossModelQueryLoading = useAppSelector(getCrossModelQueryLoading);
  const crossModelQueryErrors = useAppSelector(getCrossModelQueryErrors);
  const errorsJSON = JSON.stringify(crossModelQueryErrors, null, 2);

  const hasEqualErrors = (errors: CrossModelQueryResponse["errors"]) => {
    const firstError = Object.values(errors)[0].slice().sort();
    return Object.values(errors).reduce(
      (result, error) => result && isEqual(error.slice().sort(), firstError),
      true
    );
  };

  if (isCrossModelQueryLoading || crossModelQueryErrors === null) {
    return null;
  }

  if (
    typeof crossModelQueryErrors === "string" ||
    hasEqualErrors(crossModelQueryErrors)
  ) {
    return (
      <div className="errors-block">
        <hr />
        <h5 className="errors-block__heading u-no-margin--bottom">Error:</h5>
        {typeof crossModelQueryErrors === "string" ? (
          <p>{crossModelQueryErrors}</p>
        ) : (
          Object.values(crossModelQueryErrors)[0].map((error, index) => (
            <p className="u-no-margin--bottom" key={index}>
              {error}
            </p>
          ))
        )}
      </div>
    );
  }

  return (
    <CodeSnippetBlock
      className="errors-block"
      title="Errors"
      jsonCode={errorsJSON}
      jsonTreeData={crossModelQueryErrors}
    />
  );
};

export default ErrorsBlock;
