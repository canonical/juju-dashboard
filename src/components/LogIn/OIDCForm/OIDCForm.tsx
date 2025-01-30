import { Button, Spinner } from "@canonical/react-components";

import { endpoints } from "juju/jimm/api";
import { actions as generalActions } from "store/general";
import { getLoadingState } from "store/general/selectors";
import { useAppDispatch, useAppSelector } from "store/store";

import { Label } from "../types";

import { TestId } from "./types";

const OIDCForm = () => {
  const dispatch = useAppDispatch();
  const loadingState = useAppSelector(getLoadingState);

  return loadingState ? (
    <button className="p-button--neutral" disabled>
      <Spinner text="Connecting..." />
    </button>
  ) : (
    <Button
      appearance="positive"
      element="a"
      onClick={() => dispatch(generalActions.updateLoginLoading(true))}
      href={endpoints().login}
      data-testid={TestId.OIDC_LOGIN}
    >
      {Label.LOGIN_TO_DASHBOARD}
    </Button>
  );
};

export default OIDCForm;
