import type { ButtonProps, PropsWithSpread } from "@canonical/react-components";
import { Button } from "@canonical/react-components";
import type { HTMLProps } from "react";

import { actions as generalActions } from "store/general";
import { useAppDispatch } from "store/store";

type Props = PropsWithSpread<
  {
    visitURL: string;
    onClick?: () => void;
  },
  ButtonProps
>;

const AuthenticationButton = ({ onClick, visitURL, ...props }: Props) => {
  const dispatch = useAppDispatch();
  return (
    <Button<HTMLProps<HTMLAnchorElement>>
      element="a"
      href={visitURL}
      rel="noopener noreferrer"
      target="_blank"
      onClick={() => {
        // Remove the stored URL once the authentication page has been opened.
        // This is required as we don't have a way to match the visit URL with
        // the authentication request, so can't remove it on the login response.
        dispatch(generalActions.removeVisitURL(visitURL));
        onClick?.();
      }}
      {...props}
    />
  );
};

export default AuthenticationButton;
