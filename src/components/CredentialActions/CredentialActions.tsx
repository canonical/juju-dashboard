import {
  Button,
  ContextualMenu,
  Icon,
  usePortal,
} from "@canonical/react-components";
import type { FC } from "react";

import RemoveCredentialDialog from "components/RemoveCredentialDialog";

import { Label } from "./types";

type Props = {
  credentialTag: string;
  credentialName: string;
  modelCount?: number;
};

const CredentialActions: FC<Props> = ({
  credentialTag,
  credentialName,
  modelCount,
}: Props) => {
  const { openPortal, closePortal, isOpen, Portal } = usePortal();

  return (
    <>
      {isOpen && (
        <Portal>
          <RemoveCredentialDialog
            credentialTag={credentialTag}
            credentialName={credentialName}
            modelCount={modelCount}
            closePortal={closePortal}
          />
        </Portal>
      )}
      <ContextualMenu
        toggleAppearance="base"
        toggleClassName="u-no-margin--bottom is-dense"
        toggleLabel={
          <Icon
            name="contextual-menu"
            className="p-contextual-menu__indicator"
          />
        }
        toggleProps={{
          hasIcon: true,
          "aria-label": Label.TOGGLE,
        }}
        children={(handleClose) => (
          <Button
            className="p-contextual-menu__link"
            role="menuitem"
            hasIcon
            onClick={(event) => {
              event.stopPropagation();
              handleClose();
              openPortal(event);
            }}
          >
            <Icon name="delete" />
            <span>{Label.DESTROY}</span>
          </Button>
        )}
      />
    </>
  );
};

export default CredentialActions;
