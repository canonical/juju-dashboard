import { Button } from "@canonical/react-components";

import { endpoints } from "juju/jimm/api";

import { Label } from "../types";

import { TestId } from "./types";

const OIDCForm = () => {
  return (
    <Button
      appearance="positive"
      element="a"
      href={endpoints.login}
      data-testid={TestId.OIDC_LOGIN}
    >
      {Label.LOGIN_TO_DASHBOARD}
    </Button>
  );
};

export default OIDCForm;
