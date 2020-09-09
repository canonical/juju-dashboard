import { useEffect, useState } from "react";
import { useHistory, useLocation } from "react-router-dom";
import queryString from "query-string";

/**
 * Stores the supplied value in the query string.
 *
 * @param {String} queryKey The key to use in the query string.
 * @param {String} rootValue If the queryKey value is the same as the rootValue
 *  then do not show any value in the query parameter. This is used for the
 *  default layout view of a component.
 */
function useQueryString(queryKey, rootValue) {
  const [queryValue, setQueryValue] = useState(null);
  const history = useHistory();
  const { pathname, search } = useLocation();

  useEffect(() => {
    const queryStrings = queryString.parse(search, {
      arrayFormat: "comma",
    });
    queryStrings[queryKey] = queryValue;
    const updatedQs = queryString.stringify(queryStrings);
    history.push({
      pathname,
      search:
        queryValue === rootValue || queryValue === null ? null : updatedQs,
    });
  }, [queryValue, history, search, pathname, queryKey, rootValue]);

  return [queryValue, setQueryValue];
}

export default useQueryString;
