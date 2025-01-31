import { Button, Spinner } from "@canonical/react-components";

import { endpoints } from "juju/jimm/api";
import { actions as generalActions } from "store/general";
import { getLoginLoading } from "store/general/selectors";
import { useAppDispatch, useAppSelector } from "store/store";

import { Label } from "../types";

import { TestId } from "./types";

const OIDCForm = () => {
  const dispatch = useAppDispatch();
  const loginLoading = useAppSelector(getLoginLoading);

  return loginLoading ? (
    <button className="p-button--neutral" disabled>
      <Spinner text="Connecting..." />
    </button>
  ) : (
    <Button
      appearance="positive"
      element="a"
      // this is so that a spinner is shown as soon as user interacts with the button
      onClick={() => dispatch(generalActions.updateLoginLoading(true))}
      href={endpoints().login}
      data-testid={TestId.OIDC_LOGIN}
    >
      {Label.LOGIN_TO_DASHBOARD}
    </Button>
  );
};

export default OIDCForm;
