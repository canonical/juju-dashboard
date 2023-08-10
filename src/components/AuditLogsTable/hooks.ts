import { useCallback } from "react";
import { useSelector } from "react-redux";

import { useQueryParams } from "hooks/useQueryParams";
import {
  getControllerConnection,
  getWSControllerURL,
} from "store/general/selectors";
import { actions as jujuActions } from "store/juju";
import { useAppDispatch, useAppSelector } from "store/store";

import { DEFAULT_LIMIT_VALUE } from "./consts";

export const useFetchAuditEvents = () => {
  const dispatch = useAppDispatch();
  const wsControllerURL = useSelector(getWSControllerURL);
  const hasControllerConnection = useAppSelector((state) =>
    getControllerConnection(state, wsControllerURL)
  );

  const [queryParams] = useQueryParams<{
    page: string;
    limit: string;
  }>({
    page: "1",
    limit: DEFAULT_LIMIT_VALUE.toString(),
  });
  const limit = Number(queryParams.limit);
  const page = Number(queryParams.page);
  return useCallback(() => {
    if (!wsControllerURL || !hasControllerConnection) {
      return;
    }
    dispatch(
      jujuActions.fetchAuditEvents({
        wsControllerURL,
        // Fetch an extra entry in order to check if there are more pages.
        limit: limit + 1,
        offset: (page - 1) * limit,
      })
    );
  }, [dispatch, hasControllerConnection, limit, page, wsControllerURL]);
};
