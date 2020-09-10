import { useEffect, useState } from "react";
import { useHistory, useLocation } from "react-router-dom";
import queryString from "query-string";

/**
 * Stores the supplied value in the query string.
 *
 * @param {String} queryKey The key to use in the query string.
 * @param {String} resetValue If the value matches the queryValue then reset
 * the queryKey to empty. This is used for button groups that have a default
 * option. This value is returned as the default value of the queryValue if
 * it's empty.
 * @returns {Array} [
 *   queryValue or resetValue if the queryValue is falsy,
 *   The function to set the queryValue
 * ]
 */
function useQueryString(queryKey, resetValue) {
  const { pathname, search } = useLocation();
  const history = useHistory();
  const queryStrings = queryString.parse(search, {
    arrayFormat: "comma",
  });
  const [queryValue, setQueryValue] = useState(queryStrings[queryKey]);

  useEffect(() => {
    const queryStrings = queryString.parse(search, {
      arrayFormat: "comma",
    });
    if (
      queryStrings[queryKey] === queryValue ||
      (!queryStrings[queryKey] && queryValue === resetValue)
    ) {
      // If they are already the same value then don't push another entry.
      return;
    }
    queryStrings[queryKey] = queryValue;
    const updatedQs = queryString.stringify(queryStrings);
    history.push({
      pathname,
      search: queryValue === resetValue ? null : updatedQs,
    });
    // The `search` value is intentionally left of the dependencies array below
    // as the act of pushing the history updates the search value which puts this
    // callback into an infinite loop. Passing in queryStrings instead has the
    // same effect as it's a new object on every parse.
    // eslint-disable-next-line
  }, [queryValue, queryKey, resetValue, pathname, history]);

  return [queryValue || resetValue, setQueryValue];
}

export default useQueryString;
