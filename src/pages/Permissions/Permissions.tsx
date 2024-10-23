import { ReBACAdmin } from "@canonical/rebac-admin";

import BaseLayout from "layout/BaseLayout/BaseLayout";

const Permissions = (): JSX.Element => (
  <BaseLayout>
    <ReBACAdmin apiURL="/rebac/v1" asidePanelId="app-layout" />
  </BaseLayout>
);

export default Permissions;
