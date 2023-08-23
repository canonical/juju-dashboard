import { Button, Col, Row, Textarea } from "@canonical/react-components";
import type { FormikProps } from "formik";
import { Field, Form, Formik } from "formik";
import { useEffect, useRef } from "react";

import { copyToClipboard } from "components/utils";
import useLocalStorage from "hooks/useLocalStorage";
import { useQueryParams } from "hooks/useQueryParams";
import {
  getControllerConnection,
  getWSControllerURL,
} from "store/general/selectors";
import { actions as jujuActions } from "store/juju";
import {
  getCrossModelQueryErrors,
  getCrossModelQueryLoaded,
  getCrossModelQueryLoading,
  getCrossModelQueryResults,
} from "store/juju/selectors";
import { useAppDispatch, useAppSelector } from "store/store";

import SearchHistoryMenu from "./SearchHistoryMenu/SearchHistoryMenu";
import type { FormFields } from "./types";

export enum Label {
  SEARCH = "Search",
  COPY_JSON = "Copy JSON",
}

export const QUERY_HISTORY_KEY = "queryHistory";

const SearchForm = (): JSX.Element => {
  const formikRef = useRef<FormikProps<FormFields>>(null);
  const dispatch = useAppDispatch();
  const wsControllerURL = useAppSelector(getWSControllerURL);
  const hasControllerConnection = useAppSelector((state) =>
    getControllerConnection(state, wsControllerURL)
  );
  const [queryParams, setQueryParams] = useQueryParams<{ q: string }>({
    q: "",
  });
  const jqParam = decodeURIComponent(queryParams.q);
  const [queryHistory, setQueryHistory] = useLocalStorage<string[]>(
    QUERY_HISTORY_KEY,
    []
  );
  const crossModelQueryResultsJSON = JSON.stringify(
    useAppSelector(getCrossModelQueryResults),
    null,
    2
  );
  const isCrossModelQueryLoaded = useAppSelector(getCrossModelQueryLoaded);
  const isCrossModelQueryLoading = useAppSelector(getCrossModelQueryLoading);
  const isCrossModelQueryError =
    useAppSelector(getCrossModelQueryErrors) !== null;

  useEffect(() => {
    if (jqParam && hasControllerConnection && wsControllerURL) {
      dispatch(
        jujuActions.fetchCrossModelQuery({
          query: jqParam,
          wsControllerURL,
        })
      );
    }
  }, [dispatch, hasControllerConnection, jqParam, wsControllerURL]);

  return (
    <Formik<FormFields>
      initialValues={{
        query: jqParam,
      }}
      innerRef={formikRef}
      onSubmit={(values) => {
        const { query } = values;
        if (query) {
          setQueryParams({ q: encodeURIComponent(query) });
          setQueryHistory([
            query,
            // Remove old queries that match the new one.
            ...queryHistory.filter((previous) => previous !== query),
          ]);
        }
      }}
    >
      <Form data-testid="search-form">
        <Row className="u-no-padding">
          <Col size={6}>
            <Field
              as={Textarea}
              onKeyDown={(event: React.KeyboardEvent<HTMLTextAreaElement>) => {
                if (event.key === "Enter") {
                  // Prevent new lines from being created when Enter is pressed.
                  event.preventDefault();
                  // Submit the form.
                  formikRef.current?.handleSubmit();
                }
              }}
              name="query"
              rows={8}
            />
            <Button type="submit">{Label.SEARCH}</Button>
            <SearchHistoryMenu
              queryHistory={queryHistory}
              setQueryHistory={setQueryHistory}
            />
            <Button
              type="button"
              onClick={() => copyToClipboard(crossModelQueryResultsJSON)}
              disabled={
                !isCrossModelQueryLoaded ||
                isCrossModelQueryLoading ||
                isCrossModelQueryError
              }
            >
              {Label.COPY_JSON}
            </Button>
          </Col>
        </Row>
      </Form>
    </Formik>
  );
};

export default SearchForm;
