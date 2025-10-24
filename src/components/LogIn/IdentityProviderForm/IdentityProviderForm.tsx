import { Spinner } from "@canonical/react-components";
import type { FC } from "react";

import AuthenticationButton from "components/AuthenticationButton";
import { actions as generalActions } from "store/general";
import { useAppDispatch, useAppSelector } from "store/store";
import { testId } from "testing/utils";

import { Label } from "../types";

import { TestId } from "./types";

type Props = {
  userIsLoggedIn: boolean;
};

const IdentityProviderForm: FC<Props> = ({ userIsLoggedIn }: Props) => {
  const visitURL = useAppSelector((state) => {
    if (!userIsLoggedIn) {
      // This form only gets displayed on the main login page, at which point
      // there can only be one authentication request, so just return the
      // first one.
      return state?.general?.visitURLs?.[0] ?? null;
    }
    return null;
  });
  const dispatch = useAppDispatch();

  return visitURL ? (
    <AuthenticationButton
      appearance="positive"
      visitURL={visitURL}
      {...testId(TestId.CANDID_LOGIN)}
      onClick={() => dispatch(generalActions.updateLoginLoading(true))}
    >
      {Label.LOGIN_TO_DASHBOARD}
    </AuthenticationButton>
  ) : (
    <button className="p-button--neutral" disabled>
      <Spinner text="Connecting..." />
    </button>
  );
};

export default IdentityProviderForm;
