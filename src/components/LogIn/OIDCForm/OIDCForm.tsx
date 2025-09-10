import { Button } from "@canonical/react-components";
import type { FC } from "react";

import { endpoints } from "juju/jimm/api";
import { actions as generalActions } from "store/general";
import { useAppDispatch } from "store/store";

import { Label } from "../types";

import { TestId } from "./types";

const OIDCForm: FC = () => {
  const dispatch = useAppDispatch();

  return (
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
