import { Button, Spinner } from "@canonical/react-components";

import useLocalStorage from "hooks/useLocalStorage";
import { endpoints } from "juju/jimm/api";

import { Label } from "../types";

import { TestId } from "./types";

const OIDCForm = () => {
  const [firstVisit, setFirstVisit] = useLocalStorage<boolean>(
    "firstVisit",
    true,
  );

  return (
    <Button
      appearance="positive"
      element="a"
      href={endpoints().login}
      onClick={() => setFirstVisit(false)}
      data-testid={TestId.OIDC_LOGIN}
      disabled={!firstVisit}
    >
      {firstVisit ? Label.LOGIN_TO_DASHBOARD : <Spinner text={Label.LOADING} />}
    </Button>
  );
};

export default OIDCForm;
