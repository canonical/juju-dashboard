import { Button, ContextualMenu, Icon } from "@canonical/react-components";
import type { FC } from "react";

import { Label } from "./types";

const CredentialActions: FC = () => (
  <ContextualMenu
    toggleAppearance="base"
    toggleClassName="u-no-margin--bottom is-dense"
    toggleLabel={
      <Icon name="contextual-menu" className="p-contextual-menu__indicator" />
    }
    toggleProps={{
      hasIcon: true,
      "aria-label": Label.TOGGLE,
    }}
  >
    <Button className="p-contextual-menu__link" role="menuitem" hasIcon>
      <Icon name="delete" />
      <span>{Label.DESTROY}</span>
    </Button>
  </ContextualMenu>
);

export default CredentialActions;
