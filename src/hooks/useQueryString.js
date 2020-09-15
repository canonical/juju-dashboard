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
  const { pathname } = useLocation();
  const history = useHistory();
  const queryStrings = parseQuery();
  const [queryValue, setQueryValue] = useState(queryStrings[queryKey]);

  useEffect(() => {
    function handleBackButton() {
      const queryStrings = parseQuery();
      setQueryValue(queryStrings[queryKey]);
    }
    window.addEventListener("popstate", handleBackButton);
    return () => {
      window.removeEventListener("popstate", handleBackButton);
    };
  }, [queryKey]);

  useEffect(() => {
    const queryStrings = parseQuery();
    if (
      queryStrings[queryKey] === queryValue ||
      (!queryStrings[queryKey] && queryValue === resetValue)
    ) {
      // If they are already the same value then don't push another entry.
      return;
    }
    queryStrings[queryKey] = queryValue;
    const updatedQs = queryString.stringify(queryStrings);
    if (queryValue) {
      history.push({
        pathname,
        search: queryValue === resetValue ? null : updatedQs,
      });
    }
  }, [queryValue, queryKey, resetValue, pathname, history]);

  return [queryValue || resetValue, setQueryValue];
}

function parseQuery() {
  return queryString.parse(window.location.search, {
    arrayFormat: "comma",
  });
}

export default useQueryString;
