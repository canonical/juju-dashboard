import { ReBACAdmin, urls as generateReBACURLS } from "@canonical/rebac-admin";
import { NavLink } from "react-router-dom";

import BaseLayout from "layout/BaseLayout/BaseLayout";
import urls from "urls";

import { Label, TestId } from "./types";

const rebacURLS = generateReBACURLS(urls.permissions);

const Permissions = (): JSX.Element => (
  <BaseLayout
    data-testid={TestId.COMPONENT}
    secondaryNav={{
      title: "Permissions",
      items: [
        {
          className: "menu-one",
          items: [
            {
              component: NavLink,
              to: rebacURLS.users.index,
              label: <>{Label.USERS}</>,
            },
            {
              component: NavLink,
              to: rebacURLS.groups.index,
              label: <>{Label.GROUPS}</>,
            },
            {
              component: NavLink,
              to: rebacURLS.entitlements,
              label: <>{Label.ENTITLEMENTS}</>,
            },
            {
              component: NavLink,
              to: rebacURLS.resources.index,
              label: <>{Label.RESOURCES}</>,
            },
          ],
        },
      ],
    }}
  >
    <ReBACAdmin apiURL="/rebac/v1" asidePanelId="app-layout" />
  </BaseLayout>
);

export default Permissions;
