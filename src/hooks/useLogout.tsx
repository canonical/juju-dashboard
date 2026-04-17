import { Button } from "@canonical/react-components";
import { unwrapResult } from "@reduxjs/toolkit";

import { thunks as appThunks } from "store/app";
import { useAppDispatch } from "store/store";
import { logger } from "utils/logger";
import { toastNotification } from "utils/toastNotification";

export enum Label {
  LOGOUT_ERROR = "Error when trying to logout.",
}

const useLogout = () => {
  const dispatch = useAppDispatch();
  return (): void => {
    dispatch(appThunks.logOut())
      .then(unwrapResult)
      .catch((error) => {
        toastNotification(
          <>
            {Label.LOGOUT_ERROR} Try{" "}
            <Button
              appearance="link"
              onClick={() => {
                window.location.reload();
              }}
            >
              refreshing
            </Button>{" "}
            the page.
          </>,
          "negative",
        );
        logger.error(Label.LOGOUT_ERROR, error);
      });
  };
};

export default useLogout;
