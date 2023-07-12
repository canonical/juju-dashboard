import { useCallback } from "react";

import {
  type SetParams,
  type QueryParams,
  useQueryParams,
} from "hooks/useQueryParams";

type data = {
  th: string;
  td: string;
};

export const generatePanelTableRows = (data: data[]) => {
  return data.map(({ th, td }) => {
    return (
      <tr className="panel__tr" key={th + td}>
        <th className="panel__th">{th}</th>
        <td className="panel__td">{td}</td>
      </tr>
    );
  });
};

// TODO: Add tests for usePanelQueryParams.
export const usePanelQueryParams = <P extends QueryParams>(
  defaultQueryParams: P
): [P, SetParams<P>, () => void] => {
  const [queryParams, setQueryParams] = useQueryParams<P>(defaultQueryParams);

  const handleRemovePanelQueryParams = useCallback(() => {
    const paramsToClear: Partial<P> = {};
    Object.keys(defaultQueryParams).forEach((param: keyof P) => {
      paramsToClear[param] = undefined;
    });
    setQueryParams(paramsToClear);
  }, [defaultQueryParams, setQueryParams]);

  return [queryParams, setQueryParams, handleRemovePanelQueryParams];
};
