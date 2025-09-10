import { SideNavigation } from "@canonical/react-components";
import type { FC } from "react";

import { DARK_THEME } from "consts";

import type { Props } from "./types";

const SecondaryNavigation: FC<Props> = ({ items, title }: Props) => {
  return (
    <SideNavigation
      className="secondary-navigation"
      dark={DARK_THEME}
      items={[
        {
          items: [
            {
              className: "secondary-navigation__title",
              label: title,
              nonInteractive: true,
            },
          ],
        },
        ...(items ?? []),
      ]}
    />
  );
};

export default SecondaryNavigation;
