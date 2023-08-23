import { ContextualMenu, Icon } from "@canonical/react-components";
import { useFormikContext } from "formik";

import { useQueryParams } from "hooks/useQueryParams";
import { getCrossModelQueryLoading } from "store/juju/selectors";
import { useAppSelector } from "store/store";

import type { FormFields } from "../types";

export enum Label {
  CLEAR = "Clear history",
  HISTORY = "History",
}

type Props = {
  queryHistory: string[];
  setQueryHistory: (queryHistory: string[]) => void;
};

const SearchHistoryMenu = ({
  queryHistory,
  setQueryHistory,
}: Props): JSX.Element => {
  const loading = useAppSelector(getCrossModelQueryLoading);
  const { setFieldValue } = useFormikContext<FormFields>();
  const [, setQueryParams] = useQueryParams<{ q: string }>({
    q: "",
  });

  return (
    <ContextualMenu
      links={[
        ...queryHistory.map((query) => ({
          children: query,
          onClick: () => {
            setQueryParams({ q: encodeURIComponent(query) });
            setFieldValue("query", query);
          },
        })),
        {
          children: (
            <>
              <Icon name="delete" /> {Label.CLEAR}
            </>
          ),
          onClick: () => setQueryHistory([]),
        },
      ]}
      position="left"
      toggleClassName="has-icon"
      toggleDisabled={queryHistory.length === 0 || loading}
      toggleLabel={<Icon name="revisions">{Label.HISTORY}</Icon>}
    />
  );
};

export default SearchHistoryMenu;
